[![Build Status](https://travis-ci.org/{{github-user-name}}/{{github-app-name}}.svg?branch=master)](https://travis-ci.org/{{github-user-name}}/{{github-app-name}}.svg?branch=master)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

# argparser
A nodejs cli argument parser which convert command line arguments to a js object.

# Usage

Using a js object to define options.
```
{
  [option]:{
    required:boolean,
    handler:object,
    type:string,
    help:string,
    range:[string|number],
    genShort:boolean,
    convert:any=>any
  }
}
```
**option**  
Specify the option name. such us `color` in `ls --color ...`
**required**  
Indicate that is this option optional.

**handler**  
Specify what to do with this option.It is an object looks like:
```
{
  name: string,
  expectTokens: number,
  handle: (ret: current, ...tokens) => void
}
```
The `expectTokens` indicate the number of tokens which should be consumed by this optoin, negative number means any.
`handle` is a action function which handle current option with `tokens`
There are already 4 handlers:
+ Appender - append values to option (as array)
+ Store - store value to option
+ StoreTrue - set true flag to option (if it is appeared)
+ Count - statistics how many times this option appeared

If you do not specify it should be determined by `type`

**type**  
Specify the type of this optoin which can be :
+ List (Hander is Appender)
+ Item  (Hander is Store)
+ String (Hander is Store)
+ Number （Hander is Store)
+ Switch (Hander is Count)
+ File (Hander is Store)

All these type can be found within types.ts

**range**  
If `type` is item,you should specify an array to limit the values can be.

**genShort**  
Specify whether using a short option as the same.
The short option is the first character of long option.(short option starts with one dash and long with two)

As soon as you define option object,you can use it to parse cmd line arguments by call `cmdParse`

For example:
```
import { OptionType } from "cli-argparser/lib/types"
import { cmdParser } from "cli-argparser/lib/cmd"
let option = cmdParser({
  "all": {
    genShort: true,
    type: OptionType.SWITCH
  },
  "block-size": {
    type: OptionType.NUMBER
  },
  "color": {
    type: OptionType.ITEM,
    range: ["always", "auto", "never"]
  }
})
console.log(option)
```
And then run it with ` -a --color auto --block-size 1000`
You will see the output:
```
{ strings: [], a: 1, color: 'auto', 'block-size': 1000, all: 1 }
```

Or
```
import { cmd } from "cli-argparser"
import { types } from "cli-argparser"
let option = cmd.cmdParser({
  "all": {
    genShort: true,
    type: types.OptionType.SWITCH
  },
  "block-size": {
    type: types.OptionType.NUMBER
  },
  "color": {
    type: types.OptionType.ITEM,
    range: ["always", "auto", "never"]
  }
})
console.log(option)
```



**Node version**  
```
const { cmdParser } = require("cli-argparser/lib/cmd")
const { OptionType } = require("cli-argparser/lib/types")
let op = cmdParser({
  "all": {
    genShort: true,
    type: OptionType.SWITCH
  },
  "block-size": {
    type: OptionType.NUMBER
  },
  "color": {
    type: OptionType.ITEM,
    range: ["always", "auto", "never"]
  }
})
console.log(op)
```

Or using 
```
const { cmd, types } = require("cli-argparser")
const cmdParser = cmd.cmdParser
const OptionType = types.OptionType
```
replace 
```
const { cmdParser } = require("cli-argparser/lib/cmd")
const { OptionType } = require("cli-argparser/lib/types")
```

# Convertor

You can specify a convertor for each option. A convertor is a function which take a string as its first argument and return a converted value.

If you didn't specify a convertor,cli-argparser would select one as default (via option's type)
+ List (nil)
+ Number (toNumber)
+ File (toFile)
+ String (nil)
+ Item (nil)

>`toFile` do nothing expect varify existify 

There are several convertors defined in cli-argparser/lib/convertor.ts
They are:
+ nil  (do nothing)
+ toNumber
+ toFile
+ toReadFileStream
+ toWriteFileStream

**NOTE**
>Default value wouldn't be converted by convertor.

```
//some.js
const { cmd, types } = require("cli-argparser")
const cmdParser = cmd.cmdParser
const OptionType = types.OptionType
const { convertor } = require("cli-argparser")


let op = cmdParser({
  "in-file": {
    type: OptionType.FILE,
    convert: convertor.toReadFileStream,
  }
})
console.log(op)
```
>node some.js --in-file filePath

You will see:
```
{ strings: [],
  'in-file': 
   ReadStream {
     _readableSt
     ...
```

## Custom convertor
Some the following to custom.js
```
#!env node
const { cmd } = require("cli-argparser")
let op = cmd.cmdParser({
  json: {
    required: true,
    genShort: true,
    convert: (value) => {
      console.log("value is:", value)
      return JSON.parse(value)
    }
  }
})
console.log("option is:", op.json)
```
 And run it with :
```
chmod +x test.js
./test.js -j -- '{"a":1,"b":[1, 3]}'
```
Or
```
node test.js -j -- '{"a":1,"b":[1, 3]}'
```
You will see this output on your terminal:
```
value is: {"a":1,"b":[1, 3]}
option is: { a: 1, b: [ 1, 3 ] }
```

# Example
See example directory, if you want run it directly please install ts-node.
For example:
```
cd argparser
ts-node example/ex1.ts
```
ex1.ts is about convertor and custom convertor

# Subcommand 
That some program like `docker` has subcommands is supported now.
For exsample:
```
docker [ps|exec]

ps
==
  -a  --all show all
  -f, --filter value 

exec
====
  -i, --interactive
  -t, --tty
```

You can use `subcmdParser` to parse arguments for those cases.
`subcmdParser` takes a description object as input and return an object as result

```javascript
#!env node
const { cmd } = require("cli-argparser")
let op = cmd.subcmdParser({
  ps: {
    all: {
      genShort: true,
      type: "swicth" 
    },
    filter: {
      genShort: true
    }
  },
  exec: {
    tty: {
      genShort: true,
      type: "switch"
    },
    interactive: {
      genShort: true,
      type: "switch"
    }
  } 
})
console.log("option is:", op)

```
## Description Object
```
{
  [subCmdName:string]:{
    [optionName:string]:{
      default?: string | number,
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
  }
}
```

# Example

Save the code snippet to test.js, then try:
```
node test.js
node test.js random
node test.js random --from 10 --to 100
node test.js custom-convert --kv hello=world
```

```
#! env node
const args = require("cli-argparser")
const argsDefination = {
  //sub cmd `random`
  random: {
    //sub cmd option `from`
    from: {
      genShort: true,
      default: 0,
      type: "number",
      help: "lower bound"
    },
    to: {
      genShort: true,
      default: 1,
      type: "number",
      help: "upper bound"
    }
  },
  "custom-convert": {
    kv: {
      required: true,
      help: "key1=value1,key2=value2",
      convert: (value) =>
        value.split(",")
          .map(str => str.split("="))
          .reduce((ret, [k, v]) => (ret[k] = v, ret), {})

    }
  }
}
console.log("Arguments:\n", args.cmd.subcmdParser(argsDefination))


args.program(argsDefination, {
  random({ from, to }) {
    console.log(from + Math.random() * (to - from))
  },
  "custom-convert": (opt) => {
    console.log("Option is:", opt)
  }
})
```