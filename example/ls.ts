#!env ts-node
import * as IDebug from "debug"
IDebug.enable(".*")
import { OptionType } from "../src/types"
import { cmdParser } from "../src/cmd"
let option = cmdParser({
  "all": {
    genShort: true,
    type: OptionType.SWITCH
  },
  "block-size": {
    type: OptionType.NUMBER
  },
  "color": {
    default: "always",
    type: OptionType.ITEM,
    range: ["always", "auto", "never"]
  }
})
console.log(option)