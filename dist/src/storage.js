"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
class SchemaStorageData {
    constructor(data) { Object.assign(this, data); }
}
class SchemaStorage {
    constructor(data) {
        this.data = data || { models: [], fields: [] };
    }
    addModel(model) {
        this.data.models.push(model);
    }
    addField(field) {
        this.data.fields.push(field);
    }
}
exports.storage = new SchemaStorage();
