import { Parser } from "./parser"
import { Option, OptionItem, OptionType } from "./types"
import { StoreTrue } from "./handlers"
import { ParserError } from "./errors"
import { formatter } from "./formatter"
const Table = require("cli-table")
export interface Helper {
  usage: string,
  example?: string | [string],
  formatOptionName?: (op?: OptionItem) => string
  showOp?: (op: Option, width: number) => void
}
export function cmdParser(op: Option, helper?: Helper): any {
  if (!helper) {
    helper = {
      usage: process.argv[1] + " options",
    }
  }
  op = {
    ...op,
    help: {
      required: false,
      handler: StoreTrue,
      help: "Show help message",
      genShort: true
    }
  }

  if (process.argv.indexOf("--help") >= 0 || process.argv.indexOf("-h") >= 0) {
    console.log(process.argv.indexOf("--help"))
    showHelp(op, helper)
    process.exit()
  }
  let parser = new Parser(op)
  let arg = process.argv.slice(2).join(" ")
  let ret;
  try {
    let ret = parser.parse(arg)
    return ret;
  } catch (e) {
    if (e instanceof ParserError) {
      showParserError(e, arg)
    } else {
      console.log(e.message)
    }
    process.exit()
  }
}
function repeat<T>(ele: T, times: number): T[] {
  return new Array<T>(times).fill(ele)
}
function showParserError(err: ParserError, arg: string) {
  console.log(arg)
  let token = err.getToken()
  console.log(repeat(" ", token.pos + (token.value as string).length / 2).join("") + "^")
  console.log(err.message)
}

function defaultOptionName(op: OptionItem): string {
  return formatter[op.type] ? formatter[op.type]() : ""
}

function showHelp(op: Option, helper: Helper) {
  console.log("Usage:")
  console.log(helper.usage)
  console.log("\n")
  console.log("Options:")
  if (!helper.formatOptionName) {
    helper.formatOptionName = defaultOptionName
  }
  if (helper.showOp) {
    console.log(helper.showOp(op, 0))
  } else {
    let table = new Table({
      chars: {
        'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
        , 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
        , 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
        , 'right': '', 'right-mid': '', 'middle': ''
      }
    })
    table.push(...Object.keys(op).map(key => {
      let optionItem = op[key]
      let opName = key
      if (opName.length > 1 && optionItem.genShort) {
        opName += ", -" + key[0]
      }
      if (opName.length > 1) {
        opName = "--" + opName
      } else {
        opName = "-" + opName
      }
      helper.formatOptionName && (opName += " " + helper.formatOptionName(optionItem))
      let help = optionItem.help
      if (!help) {
        help = ""
        if (optionItem.range && optionItem.range instanceof Array) {
          help = "It should be one of " + optionItem.range.join(",")
        }
      }

      return [opName,
        optionItem.required ? "required" : "", optionItem.help || ""]
    }))
    console.log(table.toString())
  }
  console.log("\n")
  if (helper.example) {
    console.log("Examples")
    if (helper.example instanceof Array) {
      console.log(helper.example.join("\n"))
    } else {
      console.log(helper.example)
    }
  }
}