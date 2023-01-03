"use strict";
/**
 * Taken from type-graphql
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureReflectMetadataExists = exports.ReflectMetadataMissingError = void 0;
class ReflectMetadataMissingError extends Error {
    constructor() {
        super("Looks like you've forgot to provide experimental metadata API polyfill. " +
            "Please read the installation instruction for more details.");
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.ReflectMetadataMissingError = ReflectMetadataMissingError;
function ensureReflectMetadataExists() {
    if (typeof Reflect !== "object" ||
        typeof Reflect.decorate !== "function" ||
        typeof Reflect.metadata !== "function") {
        throw new ReflectMetadataMissingError();
    }
}
exports.ensureReflectMetadataExists = ensureReflectMetadataExists;
