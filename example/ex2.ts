#!env ts-node
import { OptionType } from "../src/types"
import { cmdParser } from "../src/cmd"
import { toReadFileStream, arrayConvert } from "../src/convertor"
import { ReadStream } from "fs"
let op: { echo: ReadStream, echos: ReadStream[] } = cmdParser({
  echo: {
    type: OptionType.FILE,
    convert: toReadFileStream,
    help: "display the file content"
  },
  echos: {
    type: OptionType.LIST,
    convert: arrayConvert(toReadFileStream),
    help: "display the files"
  }
}, {
    usage: "ex2.ts --echo <infile>",
    example: ["ex2.ts --echo ex1.ts"]
  })

function printFile(f: ReadStream) {
  f.on("data", (data: Buffer) => console.log(data.toString()))
}


if (op.echo) {
  printFile(op.echo)
}
if (op.echos) {
  op.echos.forEach(printFile)
}
