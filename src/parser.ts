import { TokenType, Token, Scanner } from "./scanner"
import { Option, OptionItem, OptionType } from "./types"
import { Store, Count } from "./handlers"
import { DEFAULT_HANDLER } from "./defaultHandler"
import * as IDebug from "debug"
import { ExpectValueError, RequiredError, OutOfRangeError } from "./errors"
let debug = IDebug("parser")
/**
 * {
 *    "test":{
 *      default:value
 *      require:true,
 *      type:string|number|element
 *      range:[]   
 *    }
 * 
 * }
 * 
 * 
 * 
 */
export class Parser {
  protected scanner: Scanner
  protected option: Option
  protected token: Token
  protected shortToLong: { [idx: string]: string }

  constructor(option: Option) {
    this.scanner = new Scanner()
    this.shortToLong = {} as { [idx: string]: string }
    Object.keys(option).forEach((key) => {
      this.checkOp(option, key, option[key])
    })
    this.option = option
  }
  protected checkOp(option: Option, optionName: string, op: OptionItem): void {
    if (!op.handler) {
      if (op.type && op.type in DEFAULT_HANDLER) {
        op.handler = DEFAULT_HANDLER[op.type]
      } else {
        if (optionName.length > 1) {
          op.handler = Store
        } else {
          op.handler = Count
        }
      }
    }
    if (!("type" in op)) {
      if (optionName.length > 1) {
        op.type = OptionType.STRING
      } else {
        op.type = OptionType.NUMBER
      }
    }

    if (op.type === OptionType.ITEM && !(op.range instanceof Array)) {
      throw new Error(`Option ${optionName} is an item type option,you must specify a range to tell parse which value can be option`)
    }
    if (optionName.length > 1 && op.genShort) {
      let shortName = optionName[0]
      this.shortToLong[shortName] = optionName
      if (shortName in option) {
        throw new Error(`There is already a ${shortName} in options`)
      } else {
        option[shortName] = op
      }
    }
  }

  protected match(...tokenTypes: string[]): void {
    if (tokenTypes.indexOf(this.token.type) >= 0) {
      this.token = this.scanner.next()
    } else {
      //error handler
    }
  }
  parse(content: string): any {
    this.scanner.input(content)
    this.token = this.scanner.next()
    let ret = {
      strings: []
    } as any
    let optionName: string
    while (this.token.type !== TokenType.EOF) {
      switch (this.token.type) {
        case TokenType.SHORT_OPTION:
          this.parseOption(ret)
          break;
        case TokenType.LONG_OPTIONS:
          this.parseOption(ret)
          break;
        default:
          this.otherToken(ret)
          break;
      }
    }
    for (let short of Object.keys(this.shortToLong)) {
      let long = this.shortToLong[short]
      if (short in ret) {
        ret[long] = ret[short]
      } else if (long in ret) {
        ret[short] = ret[long]
      } else {
        throw new RequiredError(long)
      }
    }
    for (let opName of Object.keys(this.option)) {
      let op = this.option[opName]
      if (op.require && !(opName in ret)) {
        throw new RequiredError(opName.length > 1 ? opName : this.shortToLong[opName])
      }
    }
    return ret
  }
  protected parseOption(ret: any): void {
    let current = this.token
    let optionItem = this.option[this.token.value]
    if (!optionItem) {
      debug(`Ignore unknow option ${this.token.value}`)
      this.match(this.token.type)
      return;
    }
    let tokens
    try {
      tokens = this.getTokens(optionItem.handler.expectTokens)
    } catch (e) {
      if (e === "need_argument")
        throw new ExpectValueError(current)
    }
    optionItem.handler.handle(ret, current, ...tokens)
    //TODO:refactor
    if (optionItem.type === OptionType.ITEM
      && optionItem.range.indexOf(tokens[0]) < 0) {
      throw new OutOfRangeError(current, optionItem.range, tokens[0].value)
    }
  }
  protected getTokens(count: number): Token[] {
    let ret: Token[] = []
    this.match(this.token.type)
    if (count < 0) {
      while ([TokenType.NUMBER, TokenType.STRING, TokenType.SYMBLE].some(type => type === this.token.type)) {
        ret.push(this.token)
        this.match(this.token.type)
      }
    } else {
      while (count > 0 && [TokenType.NUMBER, TokenType.STRING, TokenType.SYMBLE].some(type => type === this.token.type)) {
        ret.push(this.token)
        this.match(this.token.type)
        count--
      }
      if (count !== 0) {
        throw "need_argument"
      }
    }
    return ret
  }
  protected otherToken(ret: any): void {
    ret.strings.push(this.token.value)
    this.match(this.token.type)
  }

}