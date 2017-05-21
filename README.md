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
    genShort:boolean
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

All these type can be found within types.ts

**range**
If `type` is item,you should specify an array to limit the values can be.

**genShort**
Specify whether using a short option as the same.
The short option is the first character of long option.(short option starts with one dash and long with two)

As soon as you define option object,you can use it to parse cmd line arguments by call `cmdParse`

For example:
```
import { OptionType } from "cli-argparser/types"
import { cmdParser } from "cli-argparser/cmd"
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


# Example
See example directory, if you want run it directly please install ts-node.
For example:
```
cd argparser
ts-node example/ex1.ts
```

# Todo
+ Error output.
+ Generate complete shell script
