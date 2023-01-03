import { IField, iUIDFieldTypes } from "../types/field.interface";
import { IModel } from "../types/model.interface";
import fsProm from "fs/promises"
import { Path } from "typescript";

export class MetadataStorageData {
    constructor(data: MetadataStorage) { Object.assign(this, data) }
    models!: IModel[];
    fields!: IField[];
}

export class MetadataStorage {
    constructor(data?: MetadataStorageData) {
        this.data = data || { models: [], fields: [] } 
    }

    data: MetadataStorageData;

    addModel(model: IModel) {
        this.data.models.push(model);
    }

    addField(field: IField) {
        this.data.fields.push(field);
    }

    async savePrismaSchema(outputPath: string) {
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

        for (let model of this.data.models) {
            let fields = this.data.fields.filter(field => field.class === model.name);

            let schemaModel = `
model ${model.name} {
    ${fields.map(field => {
        let type : IField["type"] | string = field.type;
        let flags : string[] = [];

        if (field.unique) {
            flags.push("@unique")
        }

        if (iUIDFieldTypes.includes(type as any)) {
            flags.push("@id")
        }   else if (field.default) {
            flags.push(`@default(${field.default})`)
        }

        if (type === "id") {
            type = "int";
            flags.push("@id", "@default(autoincrement())");
        }   else if (type === "uuid") {
            type = "string";
            flags.push("@default(uuid())");
        }   else if (type === "nanoid") {
            type = "string";
            flags.push(`@default(nanoid(${field.nanoidOptions?.length || 21}))`)
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
            type = type.charAt(0).toUpperCase() + type.slice(1)
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

                let nextModelIndex = curSchema.indexOf(`model`, modelIndex + 1);
                if (nextModelIndex > ending) {
                    throw new Error("Badly formatted prisma schema")
                }

                let starting = curSchema.slice(0, modelIndex);
                curSchema = starting + schemaModel + starting.slice(ending);
            }   else {
                curSchema += schemaModel;
            }
        }   

        await fsProm.writeFile(outputPath, curSchema)
    }
}

export let storage = new MetadataStorage();