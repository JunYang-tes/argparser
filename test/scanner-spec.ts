import { TokenType, Token, Scanner } from "../src/scanner";
import * as chai from "chai";

const expect = chai.expect;
const prop = (obj: any) => (name: string) => obj[name]
const plusk = (token: Token
  , ...props: string[]) => {
  let tokenProp = prop(token)
  return props.map(p => tokenProp(p))
}
const typeAndValue = (token: any) => plusk(token, "type", "value")
const scanner = new Scanner()
scanner.input("test -a -hl --number 100 100.1 -10 -10.1 .5  \"i am a string, -q --test\\\"in string\" -- a pure string -td")

describe("scanner", () => {
  it("should get token  symble test", () => {
    let token = scanner.next()
    expect(token.type).to.equal(TokenType.SYMBLE);
    scanner.push(token);
    expect(typeAndValue(scanner.next())).to.deep.equal([TokenType.SYMBLE, "test"])
  });
  it("should get token  switch a", () => {
    expect(typeAndValue(scanner.next())).to.deep.equal([TokenType.SHORT_OPTION, "a"])
  })
  it("should get token  switch h", () => {
    expect(typeAndValue(scanner.next())).to.deep.equal([TokenType.SHORT_OPTION, "h"])
  })
  it("should get token switch l", () => {
     expect(typeAndValue(scanner.next())).to.deep.equal([TokenType.SHORT_OPTION, "l"])
  })
  it("should get token  key_value number", () => {
    expect(typeAndValue(scanner.next())).to.deep.equal([TokenType.LONG_OPTIONS, "number"])
  })
  it("should get token  number 100", () => {
    expect(typeAndValue(scanner.next())).to.deep.equal([TokenType.NUMBER, 100])
  })
  it("should get token  number 100.1", () => {
    expect(typeAndValue(scanner.next())).to.deep.equal([TokenType.NUMBER, 100.1])
  })
  it("should get token  number -10", () => {
    expect(typeAndValue(scanner.next())).to.deep.equal([TokenType.NUMBER, -10])
  })
  it("should get token  number -10.1", () => {
    expect(typeAndValue(scanner.next())).to.deep.equal([TokenType.NUMBER, -10.1])
  })
  it("should get token number .5", () => {
    expect(typeAndValue(scanner.next())).to.deep.equal([TokenType.NUMBER, .5])
  })
  it("should get token string", () => {
    let token = scanner.next()
    expect(typeAndValue(token)).to.deep.equal([TokenType.STRING, 'i am a string, -q --test\"in string'])
  })
  it("should get token string", () => {
    expect(typeAndValue(scanner.next())).to.deep.equal([TokenType.STRING, 'a pure string -td'])
  })
  it("should EOF", () => {
    expect(scanner.next().type).to.equal(TokenType.EOF)
  })
})
