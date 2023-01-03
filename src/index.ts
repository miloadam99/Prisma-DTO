import 'reflect-metadata'
import prompts from "prompts";
import { storage } from './metadata/storage';
import path from "path";
import { Model } from './decorators/model'
import { Field } from './decorators/field'

export * from './decorators/model';
export * from './decorators/field';

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

(async () => {
    let { schemaPath } = await prompts({
      type: 'text',
      name: 'schemaPath',
      message: 'Where is your schema located?',
    });

    await storage.savePrismaSchema(schemaPath);
})();  