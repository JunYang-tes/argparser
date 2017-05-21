import { Token } from "./types"
export class ParserError extends Error {
  private token: Token
  constructor(token: Token, msg: string) {
    super(msg)
    this.token = token
  }
  getToken(): Token {
    return this.token
  }
}
export class ExpectValueError extends ParserError {
  constructor(token: Token) {
    super(token, `Option ${token.value} needs one or more argument(s).`)
  }
}
export class RequiredError extends Error {
  constructor(option: string) {
    super(`Option ${option} is required.`)
  }
}
export class OutOfRangeError extends ParserError {

  constructor(optionToken: Token, expected: [string | number], got: string | number) {
    super(optionToken, `Expect argument is one of ${expected.join(',')} , but got ${got}`)
  }
}