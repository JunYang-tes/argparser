import { OptionType, convert as convertFn } from "./types"

import * as convert from "./convertor"
export const DEFAULT_CONVERT: { [index: string]: convertFn } = {
  [OptionType.FILE]: convert.toFile,
  [OptionType.NUMBER]: convert.toNumber,
}