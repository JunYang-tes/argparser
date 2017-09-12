#!env ts-node
import { OptionType } from "../src/types"
import { subcmdParser } from "../src/cmd"
console.log(subcmdParser({
  ps: {
    all: {
      genShort: true,
      type: OptionType.SWITCH
    },
    filter: {
      genShort: true
    }
  },
  exec: {
    tty: {
      genShort: true,
      type: OptionType.SWITCH
    },
    interactive: {
      genShort: true,
      type: OptionType.SWITCH
    }
  }
}))