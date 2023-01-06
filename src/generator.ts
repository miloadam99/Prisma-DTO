import fsProm from "fs/promises"
import { storage } from "./storage";
import { IField, iUIDFieldTypes } from "./types/field.interface";

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
            .then(s => s.replace(/  +/g, ' '))
            .catch(e => ''));

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

        let newSchemas: string[] = [];

        for (let model of storage.data.models) {
            let fields = storage.data.fields.filter(field => field.class === model.name);

            let schemaModel = `
model ${model.name} {
    ${fields.map(field => {
        let type : IField["type"] | string = field.type;
        let flags : string[] = [];

        if (field.unique) {
            flags.push("@unique")
        }

        if (field.primary) {
            flags.push("@id")
        }

        if (!iUIDFieldTypes.includes(type as any) && field.default) {
            flags.push(`@default(${field.default})`)
        }

        if (type === "id") {
            type = "int";
            flags.push("@default(autoincrement())");
        }   else if (type === "uuid") {
            type = "string";
            flags.push("@default(uuid())");
        }   else if (type === "nanoid") {
            type = "string";
            flags.push(`@default(nanoid(${field.nanoidOptions?.length || 21}))`)
        }   else if (type === "cuid") {
            type = 'string';
            flags.push("@default(cuid())")
        }   else if (type === "model") {
            if (!field.modelId) {
                throw new Error("Model doesn't have type to match...");
            }

            let model = storage.data.models.find(model => model.name === field.modelId);
            if (model) {
                type = model.name;
            }   else {
                type = "json";
                field.array = false;
            }
        }

        if (type !== "model") {
            type = type.charAt(0).toUpperCase() + type.slice(1);

            if (type === "Bigint") {
                type = "BigInt"
            }
        }

        return `${field.key} ${type}${field.array ? '[]' : field.nullable ? '?' : ''} ${flags.join(' ')}`
    }).join('\n    ')}
}           `.trim();

            let modelIndex = curSchema.indexOf(`model ${model.name}`);
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