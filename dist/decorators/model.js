"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const storage_1 = require("../metadata/storage");
/**
 * Adds this class to the generated prisma schema
 */
function Model(name) {
    return (target) => {
        storage_1.storage.addModel({
            name: name || target.name,
        });
    };
}
exports.Model = Model;
