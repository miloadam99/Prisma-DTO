/**
 * Adds this class to the generated prisma schema
 */
export function Model(name?: string): ClassDecorator  {
    return (target) => {
        console.log(`@Model called on ${name || target.name}`);

        if (name) {
            Reflect.defineMetadata("model:name", name, target);
        }
    }
}  