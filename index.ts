import 'reflect-metadata'
import prompts from "prompts";

export * from './src/decorators/model';
export * from './src/decorators/field';
export * from './src/generator'


// @Model()
// export class IExample {
//     constructor(example: IExample) {
//         this.id = example.id;
//         this.name = example.name;
//         this.levels = example.levels;
//     }

//     @Field("uuid")
//     id!: string;

//     @Field("string", { nullable: true })
//     name?: string;

//     @Field("int", { array: true })
//     levels: number[];
// }

// (async () => {
//   let { schemaPath } = await prompts({
//     type: 'text',
//     name: 'schemaPath',
//     message: 'Where is your schema located?',
//   });

//   await generator.savePrismaSchema(schemaPath);
// })();