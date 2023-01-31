Define your prisma schema using classes and decorators with similar syntax to Typeorm.

## Installation

```bash
npm install prisma-dto
npm install -g prisma-dto
```

## Usage

Define your models and fields in your class DTO

```typescript
@Model()
export class IExample {
    constructor(example: IExample) {
        this.id = example.id;
        this.name = example.name;
        this.levels = example.levels;
    }

    @Field("uuid")
    id!: string;

    @Field("string", { nullable: true })
    name?: string;

    @Field("int", { array: true })
    levels: number[];
}
```

This will create the following schema

```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model IExample {
  id     String  @id @default(uuid())
  name   String?
  levels Int[]
}
```