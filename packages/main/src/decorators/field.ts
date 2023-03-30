import { IField, IFieldType } from "../types/field.interface";

export interface IFieldConfig {
  // type?: IFieldType;
  nullable?: boolean;
  primary?: boolean;
  unique?: boolean;
  array?: boolean;
  default?: any;
}

export interface IEnumConfig extends IFieldConfig {
  enum: string[] | Object;
}

export interface INanoidConfig {
  /*
   * Defaults to 21
   */
  length?: number;

  customAlphabet?: string;

  /**
   * Defaults to true,
   */
  secure?: boolean;
}

// let typeToNative = new Map<string, IFieldType>()
//   .set("bigint", "bigint")
//   .set("number", "float")
//   .set("object", "json")
//   .set("boolean", "boolean")
//   .set("string", "string");
//   .set('date')

/**
 * Takes variable and determines its FieldType...
 * @param variable
 * @returns
 */
function getTypeFromNative(variable: any): IFieldType {
  if (Array.isArray(variable)) {
    if (!variable[0] || Array.isArray(variable[0])) {
      throw new Error("Invalid field type: invalid/empty array");
    }

    return getTypeFromNative(variable[0]);
  }

  // let nativeType = typeof variable;

  if (variable === "undefined") {
    throw new Error("Invalid type input: undefined");
  }

  let type = variable.name.toLowerCase();

  if (type === "number") {
    type = "float";
  } else if (type === "object") {
    type = "json";
  }

  if (!type) {
    throw new Error("Couldn't determine field type: invalid");
  }

  return type;
}

type TypeReturn = (() => Class) | IFieldType;
type ReturnOrOpts = IFieldConfig | IEnumConfig | TypeReturn;

type Class = { new (...args: any[]): any };

/**
 * Adds this field to the generated prisma schema
 * @param options
 */
export function Field(): PropertyDecorator;
export function Field(
  typeReturn: "nanoid",
  options: IFieldConfig,
  nanoidOptions: INanoidConfig
): PropertyDecorator;
// Add an override for the enum type
export function Field(
  typeReturn: "enum",
  options: IEnumConfig
): PropertyDecorator;
export function Field(typeReturn: TypeReturn): PropertyDecorator;
export function Field(options: IFieldConfig): PropertyDecorator;
export function Field(
  options: IFieldConfig,
  typeReturn: TypeReturn
): PropertyDecorator;
export function Field(
  typeReturn: TypeReturn,
  options: IFieldConfig
): PropertyDecorator;
export function Field(
  optsOrRun?: ReturnOrOpts,
  runOrOpts?: ReturnOrOpts,
  nanoidOptions?: INanoidConfig
): PropertyDecorator {
  return (target, key) => {
    let options: IFieldConfig & { enum?: IEnumConfig["enum"] } =
      typeof optsOrRun === "object" ? (optsOrRun as any) : runOrOpts;
    let typeReturn: TypeReturn =
      typeof optsOrRun === "function" || typeof optsOrRun === "string"
        ? (optsOrRun as any)
        : runOrOpts;

    let nativeType = Reflect.getOwnMetadata("design:type", target, key);

    let type: IField["type"];
    let modelId: string | undefined = undefined;
    if (!typeReturn) {
      // Determine type automatically
      type = getTypeFromNative(nativeType);
    } else {
      if (typeof typeReturn === "function") {
        modelId = typeReturn().name;

        // Sets type to json if class returned is not a stored model
        // modelId = Reflect.getMetadata("model:name", typeReturn());
        type = "model";
        // console.log(modelId);
      } else {
        type = typeReturn;
      }
    }

    Reflect.defineMetadata(
      "model:fields",
      [...(Reflect.getMetadata("model:fields", target.constructor) ?? []), key],
      target.constructor
    );

    // Check if enum is a string array or a native Enum object and convert to string array
    if (type === "enum" && options?.enum) {
      if (Array.isArray(options.enum)) {
        options.enum = options.enum.map((e) => e.toString());
      } else {
        // Here we extract all the non number keys from the enum object
        options.enum = Object.keys(options.enum).filter((key) =>
          Number.isNaN(Number(key))
        );
      }
    }

    Reflect.defineMetadata(
      `field:options`,
      {
        nullable: options?.nullable || false,
        array: options?.array || false,
        unique: options?.unique || false,
        default: options?.default,
        primary: options?.primary || false,
        nanoidOptions: nanoidOptions,
        enum: options?.enum,
        type,
        modelId,
      },
      target.constructor,
      key
    );
  };
}
