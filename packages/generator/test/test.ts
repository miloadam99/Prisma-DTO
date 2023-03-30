// Here we are to test the generateSchema function from generator.ts using mocha and chai

import { expect } from "chai";
import { generateSchema } from "../src/generator";
import { Model, Field } from "prisma-dto";
import { Class, getEnumName, parseModel } from "../src/util";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";

const modelName = "Example";

enum ExampleEnum {
  Test,
  Test2,
}

@Model(modelName)
class ExampleBase {
  @Field("uuid", { primary: true })
  id!: string;

  @Field({ nullable: true })
  name?: string;

  @Field("int", { array: true })
  levels!: number[];
}

@Model()
class ExampleChild {
  @Field("uuid", { primary: true })
  id!: string;
}

@Model(modelName)
class ExampleWithChildren extends ExampleBase {
  @Field(() => ExampleChild, { array: true })
  children!: ExampleChild[];
}

class ExampleWithEnum extends ExampleBase {
  @Field("enum", { enum: ExampleEnum })
  testEnum!: ExampleEnum;
}

// Convert the above into a prisma model
const baseSchemaFields = `
  id     String  @id @default(uuid())
  name   String?
  levels Int[]
`.trim();

// Create a function which takes in models and expected output
// and compares the output of generateSchema with the expected output
export function testGenerateSchema(
  models: Function[],
  expectedOutput: string,
  schemaPath: string,
  description: string
) {
  schemaPath = path.join(__dirname, schemaPath);
  it(description, async () => {
    await generateSchema(schemaPath, {
      models,
    });

    // Execute and wait for the command: "npx prisma format schemaPath" to finish
    await new Promise((resolve, reject) => {
      exec(`npx prisma format --schema ${schemaPath}`, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(null);
        }
      });
    });

    // Read file at schemaPath to get the output
    const output = await fs.readFile(schemaPath, { encoding: "utf8" });

    // Compare the output with the expected output
    expect(output.replace(/\s/g, "")).to.equal(
      `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

${expectedOutput}
    `
        .trim()
        .replace(/\s/g, "")
    );
  });
}

describe("generator", () => {
  describe("generateSchema", () => {
    testGenerateSchema(
      [ExampleBase],
      `
model ${modelName} {
  ${baseSchemaFields}
}
`.trim(),
      "./basicSchema.prisma",
      "should generate a schema.prisma for a simple model"
    );

    testGenerateSchema(
      [ExampleWithChildren, ExampleChild],
      `
model ${modelName} {
  ${baseSchemaFields}
  children ${ExampleChild.name}[]
}

model ${ExampleChild.name} {
  id    String   @id @default(uuid())
  Example   Example? @relation(fields: [exampleId], references: [id])
  exampleId String?
}
`.trim(),
      "./manyToManySchema.prisma",
      "should generate a schema.prisma for a model with a many-to-many relation"
    );

    const enumName = getEnumName(parseModel(ExampleBase), "testEnum");

    // Test enum w func
    testGenerateSchema(
      [ExampleWithEnum],
      `
model ${modelName} {
  ${baseSchemaFields}
  testEnum ${enumName}
}

enum ${enumName} {
    Test
    Test2
}`.trim(),
      "./enumSchema.prisma",
      "should generate a schema.prisma for a model with a enum"
    );
  });
});
