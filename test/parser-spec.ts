import * as chai from "chai"
import { OptionType } from "../src/types"
const expect = chai.expect
import * as IDebug from "debug"
IDebug.enable(".*")

import { Parser, SpecifiedParser, GuessParser } from "../src/parser"
describe("parser", () => {
  it("SpecifiedParser", () => {
    let parser = new SpecifiedParser({
      "item": {
        type: OptionType.ITEM,
        range: ["item1", "item2"]
      },
      "number": {
        type: OptionType.NUMBER
      },
      "numbers": {
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
  it("GuessParser", () => {
    let parser = new GuessParser()
    expect(parser.parse('--title "Search by bing" --text "https://www.bing.com/search?q=__arg__"  --value "https://www.bing.com/search?q=__arg__"'))
      .to.deep.equal({
        title: "Search by bing",
        text: "https://www.bing.com/search?q=__arg__",
        value: "https://www.bing.com/search?q=__arg__",
        strings: []
      })
  })

})