// Create a decorator function named Relation



// Create an overload with only a name property
import {IRelation} from "../types/relation.interface";

export function Relation(name: string): PropertyDecorator;
export function Relation(name: string, options: IRelation): PropertyDecorator;
export function Relation(options: IRelation): PropertyDecorator;
// Now create the implementation
export function Relation(nameOrOptions: string | IRelation, options?: IRelation): PropertyDecorator {
    let name: string | undefined = undefined;

    if (typeof nameOrOptions === "string") {
        name = nameOrOptions;
    }   else {
        options = nameOrOptions;
    }

    return (target, key) => {
        // Add the options to the field
        Reflect.defineMetadata(`field:relation`, {
            ...options,
            name
        }, target.constructor, key);
    };
}

