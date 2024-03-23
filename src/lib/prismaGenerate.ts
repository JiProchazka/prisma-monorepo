import { spawn } from "child_process"

export function prismaGenerate() {
  const otherCLICommand = "npx" // Replace with the name of the other CLI command
  const args = ["prisma", "generate"] // Replace with the arguments for the other CLI command

  const child = spawn(otherCLICommand, args, { stdio: "inherit" })

  child.on("error", (err: Error) => {
    console.error("Failed to Prisma generate:", err)
  })

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(`Prisma generate command exited with code ${code}`)
    }
  })
}
