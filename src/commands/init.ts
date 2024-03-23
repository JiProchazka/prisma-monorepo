import fs from "fs"

export function init() {
  const fileName = "prisma-monorepo.json"
  const fileContent = `{\n\t"inputs": [],\n\t"output": ""\n}`

  // Check if the file exists
  fs.access(fileName, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, create it
      fs.writeFile(fileName, fileContent, (err) => {
        if (err) {
          console.error("Error creating file:", err)
        } else {
          console.log(`File ./${fileName} created.`)
        }
      })
    } else {
      console.log(`File ./${fileName} already exists.`)
    }
  })
}
