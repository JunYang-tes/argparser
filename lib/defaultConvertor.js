"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const convert = require("./convertor");
exports.DEFAULT_CONVERT = {
    [types_1.OptionType.FILE]: convert.toFile,
    [types_1.OptionType.NUMBER]: convert.toNumber,
};
