#!/usr/bin/env node

import { Command } from "commander"
import { init } from "./commands/init"
import { generate } from "./commands/generate"

const program = new Command()
program.version("1.0.0").description("CLI tool for using Prisma in monorepo")

program
  .command("init")
  .description("Creates a Prisma monorepo config file")
  .action(() => {
    init()
  })

program
  .command("generate")
  .description("Merges Prisma schema files and generates Prisma client")
  .action(() => {
    generate()
  })

program.parse(process.argv)
