import { Token, TokenType, Handler } from "./types"

export const Appender: Handler = {
  name: "appender",
  expectTokens: -1,
  handle: (ret: any, current: Token, ...tokens: Token[]) => {
    let list: any;
    let option = current.value as string

    if (!(option in ret)) {
      list = ret[option] = []
    } else if (!(ret[option] instanceof Array)) {
      list = ret[option] = [ret[option]]
    } else {
      list = ret[option]
    }
    tokens.forEach(token => list.push(token.value))
  }
}
export const Store: Handler = {
  name: "store",
  expectTokens: 1,
  handle: (ret: any, current: Token, token: Token) => {
    ret[current.value.toString()] = token.value
  }
}
export const StoreTrue: Handler = {
  name: "store-true",
  expectTokens: 0,
  handle: (ret: any, current: Token) => {
    if (current.type === TokenType.LONG_OPTIONS) {
      ret[current.value] = true
    } else if (current.type === TokenType.SHORT_OPTION) {
      for (let ch of current.value as string) {
        ret[ch] = true
      }
    }
  }
}

export const Count: Handler = {
  name: "count",
  expectTokens: 0,
  handle: (ret: any, current: Token) => {
    if (current.type === TokenType.LONG_OPTIONS) {
      if (current.value in ret) {
        ret[current.value]++
      } else {
        ret[current.value] = 1
      }
    } else if (current.type === TokenType.SHORT_OPTION) {
      for (let ch of current.value as string) {
        if (ch in ret) {
          ret[ch]++
        } else {
          ret[ch] = 1
        }
      }
    }
  }
}

