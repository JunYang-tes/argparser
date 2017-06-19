import { TokenType, Token, Scanner } from "./scanner"
import { Option, OptionItem, OptionType } from "./types"
import { Store, Count } from "./handlers"
import { DEFAULT_HANDLER } from "./defaultHandler"
import { DEFAULT_CONVERT } from "./defaultConvertor"
import { nil as noConvert } from "./convertor"
import * as convert from "./convertor"
import * as IDebug from "debug"
import { ExpectValueError, ConvertError, RequiredError, OutOfRangeError, ExpectNumberError } from "./errors"
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
  protected token: Token
  constructor() {
    this.scanner = new Scanner()
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
    return ret
  }
  protected parseOption(ret: any): void {

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

export class GuessParser extends Parser {
  constructor() {
    super()
  }
  protected parseOption(ret: any): void {
    let option = this.token.value.toString()
    let values: Token[] = this.getTokens(-1)
    if (values.length === 0) {
      //count
      ret[option] = Number.isFinite(ret[option]) ? ret[option] + 1 : 1
    } else if (values.length === 1) {
      if (ret[option] instanceof Array) {
        ret[option].push(values[0].value)
      } else {
        ret[option] = values[0].value
      }
    } else {
      if (ret[option] !== undefined) {
        ret[option] = values.map(v => v.value).concat(ret[option])
      } else {
        ret[option] = values.map(v => v.value)
      }
    }
  }
}

export class SpecifiedParser extends Parser {
  protected option: Option
  protected shortToLong: { [idx: string]: string }
  constructor(option: Option) {
    super()
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
    if (!op.convert) {
      op.convert = (op.type in DEFAULT_CONVERT) ?
        DEFAULT_CONVERT[op.type] : noConvert
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


  parse(content: string): any {
    let ret = super.parse(content)
    for (let short of Object.keys(this.shortToLong)) {
      let long = this.shortToLong[short]
      if (short in ret) {
        ret[long] = ret[short]
      } else if (long in ret) {
        ret[short] = ret[long]
      } else if (this.option[long].required) {
        throw new RequiredError(long)
      }
    }
    for (let opName of Object.keys(this.option)) {
      let op = this.option[opName]
      if ("default" in op && !(opName in ret)) {
        ret[opName] = op.default
      }
      if (op.required && !(opName in ret)) {
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
      && optionItem.range.indexOf(tokens[0].value) < 0) {
      throw new OutOfRangeError(current, optionItem.range, tokens[0].value)
    }
    try
    { ret[current.value] = optionItem.convert(ret[current.value]) }
    catch (e) {
      let err = e instanceof Error ? e.message : e as string
      throw new ConvertError(current, err)
    }
  }
  protected otherToken(ret: any): void {
    ret.strings.push(this.token.value)
    this.match(this.token.type)
  }
}