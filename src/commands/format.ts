import * as fs from "fs"
import { prismaFormat } from "../lib/prismaFormat"
import { Config } from "../types/Config"

export function format() {
  const configFile = fs.readFileSync("./prisma-monorepo.json")
  const config: Config = JSON.parse(configFile.toString())

  prismaFormat(config.output || "./src/prisma/schema.prisma")
}
