const Lexor = require("lexor")
import { TokenType, Token } from "./types"
export { TokenType, Token }

export class Scanner {
  protected cmd: any
  private tokens: Token[]
  constructor() {
    this.tokens = []//new Array<Token>()
    this.cmd = new Lexor()
    this.cmd.rule(/\s/, (ctx: any) => ctx.ignore())
    this.addRules()
    this.cmd.rule(/[^\s]+/, (ctx: any) => ctx.accept("symble"))
  }
  protected addRules(): void {
    this.cmd.rule(/--\s.*/, (ctx: any, [mached]: [string]) => {
      ctx.accept("string", mached.replace(/--\s/, ""))
    })
    this.cmd.rule(/--[a-zA-Z][a-zA-Z\-0-9]+/, (ctx: any,
      [matched]: [string]) => ctx.accept("long-option", matched.substr(2)))
    this.cmd.rule(/-[^\d][a-zA-Z0-9]*/,
      (ctx: any, [matched]: [string]) => {
        for (let ch of matched.substr(1)) {
          ctx.accept("short-option", ch)
        }
      })
    this.cmd.rule(/-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.\d+)/,
      (ctx: any, [matched]: [string]) => ctx.accept("number", Number(matched)))
    this.cmd.rule(/-?\d+/, (ctx: any,
      [matched]: [string]) => ctx.accept("number", Number(matched)))
    this.cmd.rule(/"((?:\\"|[^\r\n]+)+)"/, (ctx: any,
      [mached]: [string]) => ctx.accept("string", mached.slice(1, -1)
        .replace(/\\\\/, '\\')
        .replace(/\\"/, '"')))

  }
  private toToken(token: any): Token {
    return {
      type: token.type,
      value: token.value,
      line: token.line,
      column: token.column,
      pos: token.pos
    }
  }
  input(content: string): void {
    this.cmd.input(content)
  }
  next(): Token {
    if (this.tokens.length) {
      return this.tokens.pop()
    }
    return this.toToken(this.cmd.token())
  }
  push(token: Token) {
    this.tokens.push(token)
  }
}