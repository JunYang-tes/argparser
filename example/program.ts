#!env ts-node
import { program } from "../src/program"
import { OptionType } from "../src/types"
program({
  list: {
    date: {
      required: true
    }
  },
  random: {
    from: {
      default: 0,
      type: OptionType.NUMBER
    },
    to: {
      default: 1,
      type: OptionType.NUMBER
    }
  }
}, {
    list(opt: any) {
      console.log(`list ${opt.date} `)
    },
    random({ from, to }: { from: number, to: number }) {
      console.log(from + Math.random() * (to - from))
    }
  })