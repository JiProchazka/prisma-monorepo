import * as fs from "fs"
import { Block, Comment, Schema, getSchema, printSchema } from "@mrleebo/prisma-ast"
import { Config } from "../types/Config"

export function prismaMonorepo() {
  const configFile = fs.readFileSync("./prisma-monorepo.json")
  const config: Config = JSON.parse(configFile.toString())

  const outputData = fs.readFileSync(config.output || "./src/prisma/schema.prisma")
  const outputSchema = getSchema(outputData.toString())

  const schemas: Schema[] = []

  config.inputs.forEach((input) => {
    const data = fs.readFileSync(input)
    const schema = getSchema(data.toString())
    schemas.push(schema)

    schema.list.forEach((node) => {
      processBlock(node, outputSchema, input, "model")
      processBlock(node, outputSchema, input, "view")
      processBlock(node, outputSchema, input, "type")
      processBlock(node, outputSchema, input, "enum")
    })
  })

  loopForRemove(outputSchema, schemas)

  pasteWarning(outputSchema, `// -----------------------------------------------------------------------------`, 0)
  pasteWarning(outputSchema, `// ENTITIES WITH ATTRIBUTE @@source ARE GENERATED!`, 1)
  pasteWarning(outputSchema, `// DO NOT EDIT THEM HERE, BUT IN THE ORIGINAL FILE (path in @@source attribute)!`, 2)
  pasteWarning(outputSchema, `// THEY WILL BE OVERWRITTEN!`, 3)
  pasteWarning(outputSchema, `// -----------------------------------------------------------------------------`, 4)

  const source = printSchema(
    { type: "schema", list: outputSchema.list },
    {
      sort: true,
      locales: "en-US",
      sortOrder: ["generator", "datasource", "model", "view", "enum", "type"]
    }
  )

  fs.writeFileSync(config.output || "./src/prisma/schema.prisma", source)
}

function processBlock(node: Block, outputSchema: Schema, input: string, type: "model" | "view" | "enum" | "type") {
  if (node.type === type) {
    const existingModel = outputSchema.list.find((e) => e.type === type && e.name === node.name)
    if (existingModel) {
      const existingModelIndex = outputSchema.list.indexOf(existingModel)
      if (node.type !== "enum") {
        node.properties.unshift({ type: "comment", text: `// @@source("${input}")` })
      } else {
        node.enumerators.unshift({ type: "comment", text: `// @@source("${input}")` })
      }
      outputSchema.list[existingModelIndex] = node
    } else {
      if (node.type !== "enum") {
        node.properties.unshift({ type: "comment", text: `// @@source("${input}")` })
      } else {
        node.enumerators.unshift({ type: "comment", text: `// @@source("${input}")` })
      }
      outputSchema.list.push(node)
    }
  }
}

function loopForRemove(outputSchema: Schema, schemas: Schema[]) {
  outputSchema.list.forEach((node) => {
    if (node.type === "model" || node.type === "view" || node.type === "enum" || node.type === "type") {
      let source = null
      if (node.type !== "enum") {
        source = node.properties.find((e) => e.type === "comment" && e.text.includes("@@source"))
      } else {
        source = node.enumerators.find((e) => e.type === "comment" && e.text.includes("@@source"))
      }
      if (source) {
        if (
          !schemas.some((s) =>
            s.list.some(
              (s) =>
                (s.type === "model" || s.type === "view" || s.type === "enum" || s.type === "type") &&
                s.name === node.name
            )
          )
        ) {
          const index = outputSchema.list.indexOf(node)
          outputSchema.list.splice(index, 1)
        }
      }
    }
  })
}

function pasteWarning(outputSchema: Schema, string: string, position: number) {
  if (outputSchema.list[position].type !== "comment" || (outputSchema.list[position] as Comment).text !== string) {
    outputSchema.list.splice(position, 0, {
      type: "comment",
      text: string
    })
  }
}
