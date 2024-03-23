# Prisma Monorepo

CLI tool for using Prisma in monorepo.

It is merging entities (models/view/enums/types) from more schema files into one root schema file and allowing to regenerate only those imported entites when they change. This allows you to do manual changes in the root schema file like creating relations, putting another entities, etc.

Consider following scenario:

```
my-project
  - packages
    - app
      ...
      - prisma/schema.prisma
      ...
    - lib
      ...
      - prisma/lib.prisma
      ...
```

In the `app/prisma/schema.file` you have standard `generator`, `datasource` and `model` called `Post` that you have manually created.  
In the `lib/prisma/lib.prisma` file there is just one `model` called `Car`.

When you run `npx prisma-monorepo generate` you get the following contend of `schema.prisma` file:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Post {
  id        String  @id @default(uuid())
  title     String
  content   String
  published Boolean @default(false)
}

model Car {
  // @@source("../../packages/lib/prisma/schema.prisma")
  id        Int      @id @default(autoincrement())
  make      String
  model     String
  year      Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Note the comment in `Car` model with attribute `@@source`. These is telling Prisma Monorepo to regenerate the model when generating next time and gives you a visual hint where it came from.

**Do not edit models marked with _@@souce_ attribute! They will be regenerated when generating next time!** The rest of the file is safe to be edited as you wish.  
For example you can add a relation to `Car` on the `Post` model like this:

```prisma
model Post {
  id        String  @id @default(uuid())
  ...
  carId     Int
  car       Car     @relation(fields: [carId], references: [id])
}
```

Now when you run `npx prisma-monorepo format` or regenerate with `npx prisma-monorepo generate` it will add the counterpart field to the `Car` model.  
_(Or in Visual Studio Code with a Prisma extension you can just save the file and it will do the same)_

## Installation

`$ npm i -D prisma-monorepo`

Initialize the Prisma Monorepo:

`$ npx prisma-monorepo init`

It creates a `prisma-monorepo.json` file:

```json
{
  "inputs": [],
  "output": ""
}
```

The content is pretty obvious. `inputs` is the array of relative paths to merged prisma files, `output` is the relative path to the root `schema.prisma` file.  
In our case it would be:

```json
{
  "inputs": ["../lib/prisma/lib.prisma"],
  "output": "./prisma/schema.prisma"
}
```

## Usage

At first generat the `schema.prisma` with Prisma as usual.

Create the files with entities you want to merge and add relative paths to them into the `prisma-monorepo.json` file in the root of the app.

To merge files run:

`$npx prisma-monorepo generate`

To format root schema file:

`$ npx prisma-monorepo format`

# Warranty

There is no warranty. Usage is at your own risk.
