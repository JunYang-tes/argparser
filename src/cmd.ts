import { SpecifiedParser } from "./parser"
import { Option, OptionItem, OptionType, SubcmdOption } from "./types"
import { StoreTrue } from "./handlers"
import { ParserError } from "./errors"
import { formatter } from "./formatter"
const Table = require("cli-table")
export interface Helper {
  usage?: string,
  example?: string | [string],
  formatOptionName?: (op?: OptionItem) => string
  showOp?: (op: Option, width: number) => void
}

function _cmdParser(cmd: string, op: Option): any {
  op = {
    ...op,
    help: {
      required: false,
      handler: StoreTrue,
      help: "Show help message",
      genShort: true
    }
  }
  let parser = new SpecifiedParser(op)
  let ret;
  try {
    let ret = parser.parse(cmd)
    return ret;
  } catch (e) {
    if (e instanceof ParserError) {
      showParserError(e, cmd)
    } else {
      console.log(e.message)
    }
    process.exit()
  }

}
export function subcmdParser(op: SubcmdOption, helper?: Helper) {
  let cmds = Object.keys(op)
  helper = helper || {
    usage: process.argv[1] + ` [${cmds.join("|")}] options \n\n`
  }
  if (process.argv.length < 3 || process.argv.indexOf("--help") >= 0 || process.argv.indexOf("-h") >= 0) {
    console.log("Usage:\n")
    console.log(helper.usage)
    console.log("Commands:\n\n")

    for (let cmd of cmds) {
      console.log(cmd)
      console.log(cmd.replace(/./g, "="))
      showHelp(op[cmd], {
        ...helper,
        usage: process.argv[1] + " " + cmd
      })
    }
    process.exit()
  }
  let cmd = process.argv[2]
  if (cmd in op) {
    return {
      cmd,
      result: _cmdParser(process.argv.slice(3).join(" "), op[cmd])
    }
  } else {
    console.log("Unknow command " + cmd)
  }
}


export function cmdParser(op: Option, helper?: Helper): any {
  if (!helper) {
    helper = {
      usage: process.argv[1] + " options",
    }
  }
  if (process.argv.indexOf("--help") >= 0 || process.argv.indexOf("-h") >= 0) {
    showHelp(op, helper)
    process.exit()
  }
  let arg = process.argv.slice(2).join(" ")
  return _cmdParser(arg, op)
}
function repeat<T>(ele: T, times: number): T[] {
  times = ~~times
  if (Number.isNaN(times)) {
    return []
  }
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
  if (helper.usage) {
    console.log("Usage:")
    console.log(helper.usage)
    console.log("\n")
  }
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
        optionItem.required ? "required" : "", help]
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