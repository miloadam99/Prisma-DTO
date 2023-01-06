import { IField, iUIDFieldTypes } from "./types/field.interface";
import { IModel } from "./types/model.interface";
import fsProm from "fs/promises"

class SchemaStorageData {
    constructor(data: SchemaStorageData) { Object.assign(this, data) }
    models!: IModel[];
    fields!: IField[];
}

class SchemaStorage {
    constructor(data?: SchemaStorageData) {
        this.data = data || { models: [], fields: [] } 
    }

    data: SchemaStorageData;

    addModel(model: IModel) {
        this.data.models.push(model);
    }

    addField(field: IField) {
        this.data.fields.push(field);
    }
   
}

export let storage = new SchemaStorage();