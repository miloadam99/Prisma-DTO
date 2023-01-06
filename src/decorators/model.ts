import { storage } from "../storage"

/**
 * Adds this class to the generated prisma schema
 */
export function Model(name?: string): ClassDecorator  {
    return (target) => {
        storage.addModel({
            name: name || target.name,
        })

        Reflect.defineMetadata("prisma:name", name || target.name, target);
    }
}  