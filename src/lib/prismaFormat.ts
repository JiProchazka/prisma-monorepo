import { spawn } from "child_process"

export function prismaFormat(schemaFile: string) {
  const otherCLICommand = "npx" // Replace with the name of the other CLI command
  const args = ["prisma", "format", "--schema", schemaFile] // Replace with the arguments for the other CLI command

  const child = spawn(otherCLICommand, args, { stdio: "inherit" })

  child.on("error", (err: Error) => {
    console.error("Failed to run Prisma format:", err)
  })

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(`Prisma format exited with code ${code}`)
    }
  })
}
