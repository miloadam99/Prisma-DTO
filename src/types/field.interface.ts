export type IFieldType = "int" | "float" | "string" | "json" | "uuid" | "id";

export interface IField {
    class: string;
    key: string;
    nullable: boolean;
    unique: boolean;
    array: boolean;
    default?: any;
    type: IFieldType | "model";
    modelId?: string;
}