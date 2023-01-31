import { INanoidConfig } from "../..";

export type IFieldType = "int" | "bigint" | "boolean" | "float" | "string" | "json" | IUIDFieldType;
export type IUIDFieldType = "id" | "uuid" | "nanoid" | "cuid";

export const iUIDFieldTypes: IUIDFieldType[] = ["id", "uuid", "nanoid", "cuid"];

export interface IField {
    class: string;
    key: string;
    nullable: boolean;
    unique: boolean;
    array: boolean;
    primary: boolean;
    nanoidOptions?: INanoidConfig;
    default?: any;
    type: IFieldType | "model";
    modelId?: string;
}