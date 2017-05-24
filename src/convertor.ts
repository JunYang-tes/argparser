import { convert, Token } from "./types"
import fs = require("fs")
import * as error from "./errors"
export function toNumber(value: any): any {
  let ret = Number(value)
  if (Number.isNaN(ret)) {
    throw `${value} is not a number`
  }
  return ret
}
export function toFile(value: any) {
  if (fs.existsSync(value)) {
    return value
  }
  throw `No such file ${value}`
}
export function toReadFileStream(value: any): any {
  if (fs.existsSync(value)) {
    return fs.createReadStream(value)
  }
  throw `No such file ${value}`
}
export function toWriteFileStream(value: any): any {
  if (fs.existsSync(value)) {
    return fs.createWriteStream(value)
  }
  throw `No such file ${value}`
}
export function nil(value: any): any {
  return value
}
export function arrayConvert(fn: convert): convert {
  return (value: any[]) => value.map(v => fn(v))
}