"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const storage_1 = require("../storage");
/**
 * Adds this class to the generated prisma schema
 */
function Model(name) {
    return (target) => {
        storage_1.storage.addModel({
            name: name || target.name,
        });
        Reflect.defineMetadata("prisma:name", name || target.name, target);
    };
}
exports.Model = Model;
