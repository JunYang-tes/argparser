"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cmd_1 = require("./cmd");
const util = require("util");
function program(op, funcs) {
    let parsed = cmd_1.subcmdParser(op);
    let func = funcs[parsed.cmd];
    if (util.isFunction(func)) {
        func(parsed.result);
    }
}
exports.program = program;
