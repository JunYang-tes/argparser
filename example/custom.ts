#!env ts-node
import { OptionType } from "../src/types"
import { cmdParser } from "../src/cmd"
let op: { json: any } = cmdParser({
  json: {
    required: true,
    convert: (value: any) => {
      let str = value as string
      console.log("value is:", str)
      return JSON.parse(str)
    }
  }
})
console.log("option is:", op.json)