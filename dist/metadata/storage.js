"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.MetadataStorage = exports.MetadataStorageData = void 0;
const promises_1 = __importDefault(require("fs/promises"));
class MetadataStorageData {
    constructor(data) { Object.assign(this, data); }
}
exports.MetadataStorageData = MetadataStorageData;
class MetadataStorage {
    constructor(data) {
        this.data = data || { models: [], fields: [] };
    }
    addModel(model) {
        this.data.models.push(model);
    }
    addField(field) {
        this.data.fields.push(field);
    }
    savePrismaSchema(outputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            // Instead of writing pure schema we'll upsert each individual model
            let curSchema = (yield promises_1.default.readFile(outputPath, { encoding: "utf8" })
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
}`.trim() + `\n\n`;
            }
            for (let model of this.data.models) {
                let fields = this.data.fields.filter(field => field.class === model.name);
                let schemaModel = `
model ${model.name} {
    ${fields.map(field => {
                    let type = field.type;
                    let flags = [];
                    if (field.unique) {
                        flags.push("@unique");
                    }
                    if (field.default) {
                        flags.push(`@default(${field.default})`);
                    }
                    if (type === "id") {
                        type = "int";
                        flags.push("@id", "@default(autoincrement())");
                    }
                    else if (type === "uuid") {
                        type = "string";
                        flags.push("@id", "@default(uuid())");
                    }
                    else if (type === "model") {
                        if (!field.modelId) {
                            throw new Error("Model doesn't have type to match...");
                        }
                        let model = exports.storage.data.models.find(model => model.name === field.modelId);
                        if (model) {
                            type = model.name;
                        }
                        else {
                            type = "json";
                        }
                    }
                    if (type !== "model") {
                        type = type.charAt(0).toUpperCase() + type.slice(1);
                    }
                    return `${field.key} ${type}${field.array ? '[]' : field.nullable ? '?' : ''} ${flags.join(' ')}`;
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
                        throw new Error("Badly formatted prisma schema");
                    }
                    let starting = curSchema.slice(0, modelIndex);
                    curSchema = starting + schemaModel + starting.slice(ending);
                }
                else {
                    curSchema += schemaModel;
                }
            }
            yield promises_1.default.writeFile(outputPath, curSchema);
        });
    }
}
exports.MetadataStorage = MetadataStorage;
exports.storage = new MetadataStorage();
