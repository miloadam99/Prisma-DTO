"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Field = void 0;
const storage_1 = require("../storage");
let typeToNative = new Map()
    .set("bigint", "bigint")
    .set("number", "float")
    .set("object", "json")
    .set("boolean", "boolean")
    .set("string", "string");
/**
 * Takes variable and determines its FieldType...
 * @param variable
 * @returns
 */
function getTypeFromNative(variable) {
    if (Array.isArray(variable)) {
        if (!variable[0] || Array.isArray(variable[0])) {
            throw new Error("Invalid field type: invalid/empty array");
        }
        return getTypeFromNative(variable[0]);
    }
    let nativeType = typeof variable;
    if (nativeType === "undefined") {
        throw new Error("Invalid type input: undefined");
    }
    let type = typeToNative.get(nativeType);
    if (!type) {
        throw new Error("Couldn't determine field type: invalid");
    }
    return type;
}
function Field(optsOrRun, runOrOpts, nanoidOptions) {
    return (target, key) => {
        // console.log(`@Field called on '${String(key)}' from '${target.constructor.name}'`);
        let options = typeof optsOrRun === "object" ? optsOrRun : runOrOpts;
        let typeReturn = (typeof optsOrRun === "function" || typeof optsOrRun === "string") ? optsOrRun : runOrOpts;
        let nativeType = Reflect.getOwnMetadata("design:type", target, key)();
        let type;
        let modelId = undefined;
        if (!typeReturn) {
            // Determine type automatically
            type = getTypeFromNative(nativeType);
        }
        else {
            if (typeof typeReturn === "function") {
                // Sets type to json if class returned is not a stored model
                modelId = typeReturn().name;
                type = "model";
            }
            else {
                type = typeReturn;
            }
        }
        // console.log(type)
        storage_1.storage.addField({
            key: key.toString(),
            class: target.constructor.name,
            nullable: (options === null || options === void 0 ? void 0 : options.nullable) || false,
            array: (options === null || options === void 0 ? void 0 : options.array) || false,
            unique: (options === null || options === void 0 ? void 0 : options.unique) || false,
            default: options === null || options === void 0 ? void 0 : options.default,
            primary: (options === null || options === void 0 ? void 0 : options.primary) || false,
            nanoidOptions: nanoidOptions,
            type,
            modelId,
        });
    };
}
exports.Field = Field;
