import { Appender, StoreTrue, Store, Count } from "../src/handlers";
import { TokenType } from "../src/scanner"
import * as chai from "chai"
const expect = chai.expect;
function tokens(...arg: { value: string | number, type: string }[]): any[] {
  return arg.map(e => ({
    value: e.value,
    type: e.type,
    pos: 0,
    line: 0,
    column: 0
  }))
}

describe("handler", () => {
  it("should be a list", () => {
    let ret: any = {}
    let [current, ...reset] = tokens({ value: "numbers", type: "LONG-OPTION" },
      {
        value: 1, type: "NUMBER"
      }, {
        value: 2, type: "NUMBER"
      })
    Appender.handle(ret, current, ...reset)
    expect(ret).to.deep.equal({
      numbers: [1, 2]
    })
    Appender.handle(ret, current, reset[0])
    expect(ret).to.deep.equal({
      numbers: [1, 2, 1]
    })
    Appender.handle(ret, current, ...reset)
    expect(ret).to.deep.equal({
      numbers: [1, 2, 1, 1, 2]
    })
  })
  it("should store value", () => {
    let ret: any = {}
    let [current, value] = tokens({ value: "test", type: "LONG-OPTION" }, { value: "value", type: "STRING" })
    Store.handle(ret, current, value)
    expect(ret).to.deep.equal({
      test: "value"
    })
  })

})

