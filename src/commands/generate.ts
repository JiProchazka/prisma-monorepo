import * as fs from "fs"
import { prismaFormat } from "../lib/prismaFormat"
import { prismaGenerate } from "../lib/prismaGenerate"
import { prismaMonorepo } from "../lib/prismaMonorepo"
import { Config } from "../types/Config"

export function generate() {
  const configFile = fs.readFileSync("./prisma-monorepo.json")
  const config: Config = JSON.parse(configFile.toString())

  prismaMonorepo()
  prismaFormat(config.output || "./src/prisma/schema.prisma")
  prismaGenerate()
}
