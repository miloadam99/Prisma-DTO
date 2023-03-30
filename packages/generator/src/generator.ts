import fsProm from "fs/promises";
import {
  IField,
  iUIDFieldTypes,
} from "prisma-dto/dist/src/types/field.interface";
import { IRelation } from "prisma-dto/dist/src/types/relation.interface";
import {
  capitalize,
  getEnumName,
  ParsedModel,
  parseModel,
  removeSection,
} from "./util";

export interface ISchemaOptions {
  models: Function[];
}

export interface IEnum {
  name: string;
  values: string[];
}

/**
 * Genereates a schema.prisma for prisma database
 * @param outputPath File to export prisma schema to
 * @param models list of classes to include in prisma schema
 */
export async function generateSchema(
  outputPath: string,
  options: ISchemaOptions
) {
  // Instead of writing pure schema we'll upsert each individual model
  let curSchema = await fsProm
    .readFile(outputPath, { encoding: "utf8" })
    .then((s: string) => s.replace(/  +/g, " "))
    .catch((e: any) => "");

  if (!curSchema) {
    curSchema =
      `
datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

generator client {
    provider = "prisma-client-js"
}`.trim() + `\n\n`;
  }

  const models = options.models.map(parseModel);

  let newSchemas: string[] = [];

  let enums: IEnum[] = [];

  // Write all models to schema
  for (let model of models) {
    let schemaModel = `
model ${model.name} {
    ${model.fields
      .map((field) => {
        const fieldOptions: IField = Reflect.getMetadata(
          "field:options",
          model.model,
          field
        );

        let type: IField["type"] | string = fieldOptions.type;
        let flags: string[] = [];

        if (fieldOptions.unique) {
          flags.push("@unique");
        }

        if (fieldOptions.primary) {
          flags.push("@id");
        }

        if (!iUIDFieldTypes.includes(type as any) && fieldOptions.default) {
          flags.push(`@default(${fieldOptions.default})`);
        }

        if (type === "id") {
          type = "int";
          flags.push("@default(autoincrement())");
        } else if (type === "uuid") {
          type = "string";
          flags.push("@default(uuid())");
        } else if (type === "nanoid") {
          type = "string";
          flags.push(
            `@default(nanoid(${fieldOptions.nanoidOptions?.length || 21}))`
          );
        } else if (type === "cuid") {
          type = "string";
          flags.push("@default(cuid())");
        } else if (type === "model") {
          if (!fieldOptions.modelId) {
            throw new Error("Model doesn't have type to match...");
          }

          let related = models.find(
            (m) => m.model.name === fieldOptions.modelId
          );
          if (related) {
            type = related.name;
          } else {
            type = "json";
            fieldOptions.array = false;
          }
        } else if (type === "enum") {
          type = getEnumName(model, field);
          enums.push({
            name: type,
            // @ts-ignore
            values: fieldOptions.enum || [],
          });
        }

        if (type !== "model") {
          type = capitalize(type);

          if (type === "Bigint") {
            type = "BigInt";
          } else if (type === "Datetime") {
            type = "DateTime";
          }
        }

        const relation: IRelation | undefined = Reflect.getMetadata(
          "field:relation",
          model.model,
          field
        );
        if (relation) {
          let relationFlags = [];
          if (relation.name) {
            relationFlags.push(`"${relation.name}"`);
          }

          if (relation.fields) {
            relationFlags.push(`fields: [${relation.fields.join(", ")}]`);
          }

          if (relation.references) {
            relationFlags.push(
              `references: [${relation.references.join(", ")}]`
            );
          }

          if (relation.onDelete) {
            relationFlags.push(`onDelete: ${relation.onDelete}`);
          }

          if (relation.onUpdate) {
            relationFlags.push(`onUpdate: ${relation.onUpdate}`);
          }

          flags.push(`@relation(${relationFlags.join(", ")})`);
        }

        return `${field} ${type}${
          fieldOptions.array ? "[]" : fieldOptions.nullable ? "?" : ""
        } ${flags.join(" ")}`;
      })
      .join("\n    ")}
}           `.trim();

    // Remove old model if it exists
    curSchema = removeSection(curSchema, `model ${model.name}`, `}`);

    newSchemas.push(schemaModel);
  }

  // Write all enums to schema
  for (let enumObj of enums) {
    curSchema = removeSection(curSchema, `enum ${enumObj.name}`, `}`);
    const schemaEnum = `
enum ${enumObj.name} {
    ${enumObj.values.join("\n    ")}
}`.trim();

    newSchemas.push(schemaEnum);
  }

  curSchema += newSchemas.join(`\n\n`);
  await fsProm.writeFile(outputPath, curSchema);
}
