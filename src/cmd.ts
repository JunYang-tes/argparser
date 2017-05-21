import { Parser } from "./parser"
import { Option } from "./types"
import { StoreTrue } from "./handlers"
const Table = require("cli-table")
export interface Helper {
  usage: string,
  example?: string | [string],
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
    console.log(e)
    process.exit()
  }
}
function showHelp(op: Option, helper: Helper) {
  console.log("Usage:")
  console.log(helper.usage)
  console.log("\n")
  console.log("Options:")
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