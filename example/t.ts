import { cmd, types } from "../src/index"

let option = cmd.cmdParser({
  "all": {
    genShort: true,
    type: types.OptionType.SWITCH
  },
  "block-size": {
    type: types.OptionType.NUMBER
  },
  "color": {
    default: "always",
    type: types.OptionType.ITEM,
    range: ["always", "auto", "never"]
  }
})