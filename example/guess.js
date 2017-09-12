"use strict";
exports.__esModule = true;
var parser_1 = require("../src/parser");
var p = new parser_1.GuessParser();
console.log(p.parse(" -f google --long google"));
