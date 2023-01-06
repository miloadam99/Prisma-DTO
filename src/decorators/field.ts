import { storage } from "../storage";
import { IField, IFieldType } from "../types/field.interface";

export interface IFieldConfig {
    // type?: IFieldType;
    nullable?: boolean;
    primary?: boolean;
    unique?: boolean;
    array?: boolean;
    default?: any;
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

let typeToNative = new Map<string, IFieldType>()
    .set("bigint", "bigint")
    .set("number", "float")
    .set("object", "json")
    .set("boolean", "boolean")
    .set("string", "string")

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

        return getTypeFromNative(variable[0])
    }

    let nativeType = typeof variable;

    if (nativeType === "undefined") {
        throw new Error("Invalid type input: undefined")
    }

    let type = typeToNative.get(nativeType);
    if (!type) {
        throw new Error("Couldn't determine field type: invalid")
    }

    return type;
}

type TypeReturn = (() => Class) | IFieldType;
type ReturnOrOpts = IFieldConfig | TypeReturn;

type Class = { new(...args: any[]): any; };

/**
 * Adds this field to the generated prisma schema
 * @param options 
 */
export function Field(): PropertyDecorator;
export function Field(typeReturn: "nanoid", options: IFieldConfig, nanoidOptions: INanoidConfig): PropertyDecorator
export function Field(typeReturn: TypeReturn): PropertyDecorator;
export function Field(options: IFieldConfig): PropertyDecorator;
export function Field(options: IFieldConfig, typeReturn: TypeReturn): PropertyDecorator
export function Field(typeReturn: TypeReturn, options: IFieldConfig): PropertyDecorator
export function Field(
    optsOrRun?: ReturnOrOpts,
    runOrOpts?: ReturnOrOpts,
    nanoidOptions?: INanoidConfig
): PropertyDecorator  {
    return (target, key) => {
        // console.log(`@Field called on '${String(key)}' from '${target.constructor.name}'`);

        let options: IFieldConfig = typeof optsOrRun === "object" ? optsOrRun as any : runOrOpts;
        let typeReturn: TypeReturn = (typeof optsOrRun === "function" || typeof optsOrRun === "string") ? optsOrRun as any : runOrOpts;
        
        let nativeType = Reflect.getOwnMetadata("design:type",  target, key)();

        let type: IField["type"];
        let modelId: string | undefined = undefined;
        if (!typeReturn) {
            // Determine type automatically
            type = getTypeFromNative(nativeType);
        }   else {
            if (typeof typeReturn === "function") {
                // Sets type to json if class returned is not a stored model
                modelId = typeReturn().name;
                type = "model";
            }   else {
                type = typeReturn;
            }
        }
        
        // console.log(type)

        storage.addField({
            key: key.toString(),
            class: target.constructor.name,
            nullable: options?.nullable || false,
            array: options?.array || false,
            unique:  options?.unique || false,
            default: options?.default,
            primary: options?.primary || false,
            nanoidOptions: nanoidOptions,
            type,
            modelId,
        })

    }
}  