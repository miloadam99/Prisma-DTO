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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IExample = void 0;
require("reflect-metadata");
const prompts_1 = __importDefault(require("prompts"));
const storage_1 = require("./metadata/storage");
const model_1 = require("./decorators/model");
const field_1 = require("./decorators/field");
__exportStar(require("./decorators/model"), exports);
__exportStar(require("./decorators/field"), exports);
let IExample = class IExample {
    constructor(example) {
        this.id = example.id;
        this.name = example.name;
        this.levels = example.levels;
    }
};
__decorate([
    (0, field_1.Field)("uuid"),
    __metadata("design:type", String)
], IExample.prototype, "id", void 0);
__decorate([
    (0, field_1.Field)("string", { nullable: true }),
    __metadata("design:type", String)
], IExample.prototype, "name", void 0);
__decorate([
    (0, field_1.Field)("int", { array: true }),
    __metadata("design:type", Array)
], IExample.prototype, "levels", void 0);
IExample = __decorate([
    (0, model_1.Model)(),
    __metadata("design:paramtypes", [IExample])
], IExample);
exports.IExample = IExample;
(() => __awaiter(void 0, void 0, void 0, function* () {
    let { schemaPath } = yield (0, prompts_1.default)({
        type: 'text',
        name: 'schemaPath',
        message: 'Where is your schema located?',
    });
    yield storage_1.storage.savePrismaSchema(schemaPath);
}))();
