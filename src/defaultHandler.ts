import { OptionType, Handler } from "./types"
import { Appender, Store, Count } from "./handlers"
export const DEFAULT_HANDLER = {
  [OptionType.LIST]: Appender,
  [OptionType.NUMBER]: Store,
  [OptionType.STRING]: Store,
  [OptionType.ITEM]: Store,
  [OptionType.SWITCH]: Count
}