import * as chai from "chai"
import { OptionType } from "../src/types"
const expect = chai.expect
import * as IDebug from "debug"
IDebug.enable(".*")

import { Parser } from "../src/parser"
describe("parser", () => {
  it("", () => {
    let parser = new Parser({
      "item": {
        require: true,
        type: OptionType.ITEM,
        range: ["item1", "item2"]
      },
      "number": {
        type: OptionType.NUMBER
      },
      "numbers": {
        require: true,
        type: OptionType.LIST
      },
      "a": {
        type: OptionType.SWITCH
      }
    })
    expect(parser.parse(`--item item1 --number 100 --numbers 1 2 --numbers 3`)).to.deep.equal({
      item: "item1",
      number: 100,
      numbers: [1, 2, 3],
      strings: []
    })
    expect(parser.parse("-aaaa")).to.deep.equal({
      a: 4,
      strings: []
    })
  })
})