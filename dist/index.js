"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
__exportStar(require("./src/decorators/model"), exports);
__exportStar(require("./src/decorators/field"), exports);
__exportStar(require("./src/generator"), exports);
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
