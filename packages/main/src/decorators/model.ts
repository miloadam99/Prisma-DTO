/**
 * Adds this class to the generated prisma schema
 */
export function Model(name?: string): ClassDecorator  {
    return (target) => {
        console.log(`@Model called on ${name || target.name}'`);
        Reflect.defineMetadata("model:options", { name: name, class: target.name }, target);
    }
}  