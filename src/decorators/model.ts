import { storage } from "../metadata/storage"

/**
 * Adds this class to the generated prisma schema
 */
export function Model(name?: string): ClassDecorator  {
    return (target) => {
        storage.addModel({
            name: name || target.name,
        })
    }
}  