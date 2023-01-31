import fsProm from "fs/promises"
import { IField, iUIDFieldTypes } from "prisma-dto/dist/src/types/field.interface";

export type Class = (...args: any[]) => any;

export interface ISchemaOptions {
    models: Function[];
}

export class SchemaGenerator {
    constructor(options: ISchemaOptions) {
        this.options = options;


    }

    options: ISchemaOptions;

    /**
     * Genereates a schema.prisma for prisma database
     * @param outputPath File to export prisma schema to
     * @param models list of classes to include in prisma schema
     */
    async exportPrismaSchema(outputPath: string) {

        
        // Instead of writing pure schema we'll upsert each individual model
        let curSchema = (await fsProm.readFile(outputPath, { encoding: "utf8" })
            .then((s: string) => s.replace(/  +/g, ' '))
            .catch((e: any) => ''));

        if (!curSchema) {
            curSchema = `
datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

generator client {
    provider = "prisma-client-js"
}`.trim() + `\n\n`
        }

        const models: { model: any, name: string, fields: string[] }[] = this.options.models.map(m => {
            // @ts-ignore
            const model = new m();

            const options = Reflect.getMetadata("model:options", model);

            return {
                model,
                name: options.name || options.class,
                fields: Reflect.getMetadata("model:fields", model)
            }
            
        })

        let newSchemas: string[] = [];

        for (let model of models) {
            let schemaModel = `
model ${model.name} {
    ${model.fields.map(field => {
        const fieldOptions: IField = Reflect.getMetadata('field:options', model.model, field);

        let type : IField["type"] | string = fieldOptions.type;
        let flags : string[] = [];

        if (fieldOptions.unique) {
            flags.push("@unique")
        }

        if (fieldOptions.primary) {
            flags.push("@id")
        }

        if (!iUIDFieldTypes.includes(type as any) && fieldOptions.default) {
            flags.push(`@default(${fieldOptions.default})`)
        }

        if (type === "id") {
            type = "int";
            flags.push("@default(autoincrement())");
        }   else if (type === "uuid") {
            type = "string";
            flags.push("@default(uuid())");
        }   else if (type === "nanoid") {
            type = "string";
            flags.push(`@default(nanoid(${fieldOptions.nanoidOptions?.length || 21}))`)
        }   else if (type === "cuid") {
            type = 'string';
            flags.push("@default(cuid())")
        }   else if (type === "model") {
            if (!fieldOptions.modelId) {
                throw new Error("Model doesn't have type to match...");
            }

            let related = models.find((m) => m.name === fieldOptions.modelId);
            if (related) {
                type = related.name;
            }   else {
                type = "json";
                fieldOptions.array = false;
            }
        }

        if (type !== "model") {
            type = type.charAt(0).toUpperCase() + type.slice(1);

            if (type === "Bigint") {
                type = "BigInt"
            }
        }

        return `${fieldOptions.key} ${type}${fieldOptions.array ? '[]' : fieldOptions.nullable ? '?' : ''} ${flags.join(' ')}`
    }).join('\n    ')}
}           `.trim();

            let modelIndex = curSchema.indexOf(`model ${name}`);
            if (modelIndex !== -1) {
                let ending = curSchema.indexOf(`}`, modelIndex);
                if (ending === -1) {
                    throw new Error("Coudln't find ending for model");
                }

                // let nextModelIndex = curSchema.indexOf(`model`, modelIndex + 1);
                // if (nextModelIndex > ending) {
                //     throw new Error("Badly formatted prisma schema")
                // }

                let starting = curSchema.slice(0, modelIndex);
                curSchema = starting + starting.slice(ending);
            }

            newSchemas.push(schemaModel)
        }   

        curSchema += newSchemas.join(`\n\n`)
        await fsProm.writeFile(outputPath, curSchema)
    }
}