import { subcmdParser } from "./cmd"
import { SubcmdOption } from "./types"
import * as util from "util"
export function program(op: SubcmdOption, funcs: any) {
  let parsed = subcmdParser(op)
  let func = funcs[parsed.cmd]
  if (util.isFunction(func)) {
    func(parsed.result)
  }
}