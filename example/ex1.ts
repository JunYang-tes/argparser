#!env ts-node
import { OptionType } from "../src/types"
import { cmdParser } from "../src/cmd"
let op: { sum: [number] } = cmdParser({
  sum: {
    require: true,
    type: OptionType.LIST,
    help: "accumulate all numbers"
  }
}, {
    usage: "ex1.ts <option> <num1,num2...>",
    example: ["ex1.ts --sum 1 2 3 4"]
  })
console.log("sum:", op.sum.reduce((ret, next) => ret + next))