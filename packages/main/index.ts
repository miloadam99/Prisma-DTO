import 'reflect-metadata'

export * from './src/decorators/model';
export * from './src/decorators/field';

// import { Model } from "./src/decorators/model"
// import { Field } from "./src/decorators/field"


// @Model()
// export class IExample {
//     constructor(example: IExample) {
//         this.id = example.id;
//         this.name = example.name;
//         this.levels = example.levels;
//     }

//     @Field("uuid", { primary: true })
//     id!: string;

//     @Field()
//     name?: bigint;

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