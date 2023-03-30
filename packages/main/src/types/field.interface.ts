import { INanoidConfig } from "../..";

export type IFieldType =
  | "int"
  | "bigint"
  | "boolean"
  | "float"
  | "string"
  | "json"
  | IUIDFieldType
  | "date"
  | "datetime"
  | "enum";

export type IUIDFieldType = "id" | "uuid" | "nanoid" | "cuid";

export type ICascade =
  | "Cascade"
  | "Restrict"
  | "NoAction"
  | "SetNull"
  | "SetDefault";

export const iUIDFieldTypes: IUIDFieldType[] = ["id", "uuid", "nanoid", "cuid"];

export interface IField {
  // class: string;
  // key: string;
  nullable: boolean;
  unique: boolean;
  array: boolean;
  primary: boolean;
  nanoidOptions?: INanoidConfig;
  onDelete?: ICascade;
  onUpdate?: ICascade;
  default?: any;
  type: IFieldType | "model";
  modelId?: string;
}
