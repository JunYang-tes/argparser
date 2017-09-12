export const TokenType = {
  LONG_OPTIONS: "long-option",
  SHORT_OPTION: "short-option",
  NUMBER: "number",
  STRING: "string",
  SYMBLE: "symble",
  EOF: "EOF"
}
export interface convert {
  (value: any, option?: Token): any
}

export interface Token {
  type: string
  value: string | number
  line: number
  column: number
  pos: number
}
export const OptionType = {
  LIST: "list",
  STRING: "string",
  NUMBER: "number",
  ITEM: "item",
  SWITCH: "switch",
  FILE: "file",
}
export interface OptionItem {
  default?: string | number,
  //default is undefine (false)
  required?: boolean,
  handler?: Handler,
  /**
   * @see OptionType
   * @desc Default type is "string" for long-option,"switch" for short-option
   */
  type?: string,
  help?: string,
  range?: [any],
  convert?: convert,
  genShort?: boolean,
}
export interface Option {
  [idx: string]: OptionItem
}
export interface Handler {
  name: string,
  expectTokens: number,
  handle: (ret: any, current: Token, ...tokens: Token[]) => void
}
export interface SubcmdOption {
  [name: string]: Option
}
export interface SubcmdResult {
  cmd: string,
  result: any
}