Define your prisma schema using classes and decorators with similar syntax to Typeorm.

## Installation

```bash
npm install prisma-dto reflect-metadata
```

## Usage

Define your models and fields in your class DTO

```typescript
import {Relation} from "./relation";

@Model()
export class Post {
  @Field("id", { primary: true })
  id!: number;

  @Field("string")
  name!: string;

  // Create an implicit many to many relationship
  @Field(() => User, { array: true })
  likedBy!: User[];
  
  @Field(() => User)
  @Relation('Author', { references: ['id'], fields: ['authorId'] })
  author!: any;

  @Field('int')
  authorId!: number;
}

@Model()
export class User {
  constructor(example: IExample) {
    this.id = example.id;
    this.name = example.name;
    this.levels = example.levels;
  }

  @Field("id", { primary: true })
  id!: number;

  @Field("string", { nullable: true })
  name?: string;

  @Field(() => Post, { array: true })
  @Relation('author')
  posts!: Post[];

  // Create an implicit many to many relationship
  @Field(() => Post, { array: true })
  likedPosts!: Post[];

  // Enums can also be an array of strings
  @Field("enum", { enum: UserRole })
  role?: UserRole;
}

enum UserRole {
  USER,
  ADMIN,
}
```

### Generating Your Schema 
- installing the prisma-dto-generator package on your node server

```bash
npm install prisma-dto-generator
  ```
- creating a file containing the following in the prisma folder
- execute this file via `npx ts-node prisma/prisma-dto.ts`

```typescript
import { generatePrismaSchema } from "prisma-dto-generator";
generatePrismaSchema([User, Post], "schema.prisma");
```

```
db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

client {
  provider = "prisma-client-js"
}

model Post {
  id    Int    @id @default(autoincrement())
  name  String
  likedBy User[]

  author   User @relation('author', fields: [authorId], references: [id])
  authorId Int
}

model User {
  id       Int    @id @default(autoincrement())
  name     String?
  posts    Post[] @relation("author")
  likedPosts Post[]
  role     UserRole?
}

enum UserRole {
  USER
  ADMIN
}
```

Enjoy!