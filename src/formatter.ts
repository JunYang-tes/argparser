import { Option, OptionType } from "./types"
export const formatter: { [idx: string]: () => string } = {
  [OptionType.ITEM]: () => {
    return "<arg>"
  },
  [OptionType.LIST]: () => {
    return "<arg> ..."
  },
  [OptionType.NUMBER]: () => {
    return "<num>"
  },
  [OptionType.STRING]: () => {
    return "<string>"
  },
  [OptionType.SWITCH]: () => {
    return ""
  }
}