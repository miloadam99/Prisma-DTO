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
exports.SchemaGenerator = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const storage_1 = require("./storage");
const field_interface_1 = require("./types/field.interface");
class SchemaGenerator {
    constructor(options) {
        this.options = options;
    }
    /**
     * Genereates a schema.prisma for prisma database
     * @param outputPath File to export prisma schema to
     * @param models list of classes to include in prisma schema
     */
    exportPrismaSchema(outputPath) {
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
            let newSchemas = [];
            for (let model of storage_1.storage.data.models) {
                let fields = storage_1.storage.data.fields.filter(field => field.class === model.name);
                let schemaModel = `
model ${model.name} {
    ${fields.map(field => {
                    var _a;
                    let type = field.type;
                    let flags = [];
                    if (field.unique) {
                        flags.push("@unique");
                    }
                    if (field.primary) {
                        flags.push("@id");
                    }
                    if (!field_interface_1.iUIDFieldTypes.includes(type) && field.default) {
                        flags.push(`@default(${field.default})`);
                    }
                    if (type === "id") {
                        type = "int";
                        flags.push("@default(autoincrement())");
                    }
                    else if (type === "uuid") {
                        type = "string";
                        flags.push("@default(uuid())");
                    }
                    else if (type === "nanoid") {
                        type = "string";
                        flags.push(`@default(nanoid(${((_a = field.nanoidOptions) === null || _a === void 0 ? void 0 : _a.length) || 21}))`);
                    }
                    else if (type === "cuid") {
                        type = 'string';
                        flags.push("@default(cuid())");
                    }
                    else if (type === "model") {
                        if (!field.modelId) {
                            throw new Error("Model doesn't have type to match...");
                        }
                        let model = storage_1.storage.data.models.find(model => model.name === field.modelId);
                        if (model) {
                            type = model.name;
                        }
                        else {
                            type = "json";
                            field.array = false;
                        }
                    }
                    if (type !== "model") {
                        type = type.charAt(0).toUpperCase() + type.slice(1);
                        if (type === "Bigint") {
                            type = "BigInt";
                        }
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
                    // let nextModelIndex = curSchema.indexOf(`model`, modelIndex + 1);
                    // if (nextModelIndex > ending) {
                    //     throw new Error("Badly formatted prisma schema")
                    // }
                    let starting = curSchema.slice(0, modelIndex);
                    curSchema = starting + starting.slice(ending);
                }
                newSchemas.push(schemaModel);
            }
            curSchema += newSchemas.join(`\n\n`);
            yield promises_1.default.writeFile(outputPath, curSchema);
        });
    }
}
exports.SchemaGenerator = SchemaGenerator;
