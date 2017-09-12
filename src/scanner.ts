const Lexor = require("lexor")
import { TokenType, Token } from "./types"
export { TokenType, Token }

export class Scanner {
  protected cmd: Tokenizer
  private tokens: Token[]
  constructor() {
    this.tokens = []//new Array<Token>()
    this.cmd = new Tokenizer()
  }
  input(content: string): void {
    this.cmd.reset(content)
  }
  next(): Token {
    if (this.tokens.length) {
      return this.tokens.pop()
    }
    let token = this.cmd.getToken()
    if (token.type === TokenType.SHORT_OPTION) {
      let tokens = []
      let pos = token.pos
      for (let ch of "" + token.value) {
        tokens.push({
          ...token,
          value: ch,
          column: pos,
          pos: pos++
        })
      }
      while (tokens.length) {
        this.tokens.push(
          tokens.pop()
        )
      }
      return this.tokens.pop()
    } else {
      return token
    }
  }
  push(token: Token) {
    this.tokens.push(token)
  }
}
export class Tokenizer {
  static START = 0
  static END = 1
  static SYMBOL = 2 //NOT quoted string
  static ESCAPE = 3
  static DASH = 4
  static LONG_OP = 5
  static SORT_OP = 6
  static STRING = 7
  static OR_STRING = 8
  static NUMBER = 9


  static EOL = "EOL"
  private quotations = ["'", '"', "`"]
  private input: string
  private idx: number
  private getChar(): string {
    if (this.idx < this.input.length) {
      return this.input[this.idx++]
    } else {
      return "EOL"
    }
  }
  private escaping: { [name: string]: string } = {
    't': '\t',
    'n': '\n',
    'r': '\r',
    '\\': '\\',
    ' ': ' '
  }
  private quotation: string
  private inStart(buffer: string[]): number {
    let ch = this.getChar()
    if (ch === Tokenizer.EOL) {
      return Tokenizer.END
    } else if (ch === "-") {
      return Tokenizer.DASH
    } else if (/\s/.test(ch)) {
      return Tokenizer.START
    } else if (this.quotations.indexOf(ch) >= 0) {
      this.quotation = ch
      return Tokenizer.STRING
    } else if (/[\d+.]/.test(ch)) {
      buffer.push(ch)
      return Tokenizer.NUMBER
    } else {
      buffer.push("" + ch)
      return Tokenizer.SYMBOL
    }
  }
  private inDash(buffer: string[]): number {
    let ch = this.getChar()
    if (ch === Tokenizer.EOL) {
      return Tokenizer.END
    } else {
      if (/\d/.test(ch)) {
        buffer.push("-")
        buffer.push(ch)
        return Tokenizer.NUMBER
      } else if (ch === "-") {
        let next = this.getChar();
        if (/\s/.test(next + "")) {
          return Tokenizer.OR_STRING
        } else {
          buffer.push(next)
          return Tokenizer.LONG_OP
        }
      } else {
        buffer.push(ch)
        return Tokenizer.SORT_OP
      }
    }
  }

  private inNumber(buffer: string[]) {
    let ch = this.getChar()

    if (ch === Tokenizer.EOL) {
      return Tokenizer.END
    } else if (/\d/.test(ch)) {
      buffer.push(ch)
      return Tokenizer.NUMBER
    } else if (/\s/.test(ch)) {
      return Tokenizer.END
    } else if (ch === "." && buffer.indexOf(".") < 0) {
      buffer.push(ch)
      return Tokenizer.NUMBER
    } else {
      buffer.push(ch)
      if (buffer[0] === "-") {
        return Tokenizer.SORT_OP
      } else {
        return Tokenizer.SYMBOL
      }
    }
  }

  private inOp(buffer: string[], state: number) {
    let ch = this.getChar()
    if (ch === Tokenizer.EOL) {
      return Tokenizer.END
    } else if (ch == "\\") {
      let next = this.getChar()
      if (this.escape(buffer, ch, next) === Tokenizer.END) {
        return Tokenizer.END
      } else {
        return state
      }
    } else if (/\s/.test(ch)) {
      return Tokenizer.END
    } else {
      buffer.push(ch)
      return state
    }
  }

  private escape(buffer: string[], curr: string, next: string) {
    if (next === Tokenizer.EOL) {
      buffer.push(curr)
      return Tokenizer.END
    } else if (this.quotations.indexOf(next) >= 0) {
      buffer.push(next)
    } else if (next in this.escaping) {
      buffer.push(this.escaping[next])
    } else {
      buffer.push(curr)
      buffer.push(next)
    }
  }
  private inString(buffer: string[]) {
    let ch = this.getChar()
    if (ch == Tokenizer.EOL || ch === this.quotation) {
      return Tokenizer.END
    } else if (ch == "\\") {
      //simplify escaping
      let next = this.getChar()
      if (this.escape(buffer, ch, next) === Tokenizer.END) {
        return Tokenizer.END
      }
      return Tokenizer.STRING
    } else {
      buffer.push(ch)
      return Tokenizer.STRING
    }
  }

  private getRest() {
    return this.input.slice(this.idx)
  }

  public reset(input: string) {
    this.input = input
    this.idx = 0
  }




  public getToken(): Token {
    let state = 0
    let buffer: string[] = []
    let token: Token = {
      type: "",
      value: "",
      line: 1,
      column: 0,
      pos: 0
    }
    while (state !== Tokenizer.END) {
      switch (state) {
        case Tokenizer.START:
          state = this.inStart(buffer)
          token.pos = token.column = this.idx - 1
          break;

        case Tokenizer.STRING:
          state = this.inString(buffer)
          token.type = TokenType.STRING
          break;

        case Tokenizer.DASH:
          state = this.inDash(buffer)
          break;

        case Tokenizer.LONG_OP:
          token.type = TokenType.LONG_OPTIONS
          state = this.inOp(buffer, Tokenizer.LONG_OP)
          break;

        case Tokenizer.SORT_OP:
          token.type = TokenType.SHORT_OPTION
          state = this.inOp(buffer, Tokenizer.SORT_OP)
          break;

        case Tokenizer.NUMBER:
          token.type = TokenType.NUMBER
          state = this.inNumber(buffer)
          break;

        case Tokenizer.OR_STRING:
          buffer.push(this.getRest())
          state = Tokenizer.END
          this.idx = this.input.length
          token.type = TokenType.STRING
          break;
        case Tokenizer.SYMBOL:
          state = this.inOp(buffer, Tokenizer.SYMBOL)
          token.type = TokenType.SYMBLE
          break
        default:
          console.log("unexpected batch")
          break;
      }
    }

    token.value = buffer.join("")
    if (!token.value.length) {
      token.type = TokenType.EOF
    }
    if (token.type === TokenType.SHORT_OPTION) {
      token.value = token.value.replace(/^-/, "")
    } else if (token.type === TokenType.NUMBER) {
      let num = +token.value
      if (!Number.isNaN(num)) {
        token.value = num
      }
    }

    return token
  }
}
