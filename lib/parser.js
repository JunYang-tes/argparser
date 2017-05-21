"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scanner_1 = require("./scanner");
const types_1 = require("./types");
const handlers_1 = require("./handlers");
const defaultHandler_1 = require("./defaultHandler");
const IDebug = require("debug");
let debug = IDebug("parser");
let test = {
    "test": {
        default: "100",
        require: false,
        type: "string",
    }
};
class Parser {
    constructor(option) {
        console.log(debug);
        debug("create parser");
        this.scanner = new scanner_1.Scanner();
        Object.keys(option).forEach((key) => {
            this.checkOp(option, key, option[key]);
        });
        this.option = option;
    }
    checkOp(option, optionName, op) {
        if (!op.handler) {
            if (op.type && op.type in defaultHandler_1.DEFAULT_HANDLER) {
                op.handler = defaultHandler_1.DEFAULT_HANDLER[op.type];
            }
            else {
                if (optionName.length > 1) {
                    op.handler = handlers_1.Store;
                }
                else {
                    op.handler = handlers_1.Count;
                }
            }
        }
        if (!("type" in op)) {
            if (optionName.length > 1) {
                op.type = types_1.OptionType.STRING;
            }
            else {
                op.type = types_1.OptionType.NUMBER;
            }
        }
        if (op.type === types_1.OptionType.ITEM && !(op.range instanceof Array)) {
            throw new Error(`Option ${optionName} is an item type option,you must specify a range to tell parse which value can be option`);
        }
        if (optionName.length > 1 && op.genShort) {
            let shortName = optionName[0];
            if (shortName in option) {
                throw new Error(`There is already a ${shortName} in options`);
            }
            else {
                option[shortName] = op;
            }
        }
    }
    match(...tokenTypes) {
        if (tokenTypes.indexOf(this.token.type) >= 0) {
            this.token = this.scanner.next();
        }
        else {
        }
    }
    parse(content) {
        this.scanner.input(content);
        this.token = this.scanner.next();
        let ret = {
            strings: []
        };
        let optionName;
        while (this.token.type !== scanner_1.TokenType.EOF) {
            switch (this.token.type) {
                case scanner_1.TokenType.SHORT_OPTION:
                    this.parseLongOption(ret);
                    break;
                case scanner_1.TokenType.LONG_OPTIONS:
                    this.parseLongOption(ret);
                    break;
                default:
                    this.otherToken(ret);
                    break;
            }
        }
        return ret;
    }
    parseLongOption(ret) {
        let current = this.token;
        let optionItem = this.option[this.token.value];
        if (!optionItem) {
            return;
        }
        let tokens = this.getTokens(optionItem.handler.expectTokens);
        optionItem.handler.handle(ret, current, ...tokens);
    }
    getTokens(count) {
        let ret = [];
        this.match(this.token.type);
        if (count < 0) {
            while ([scanner_1.TokenType.NUMBER, scanner_1.TokenType.STRING, scanner_1.TokenType.SYMBLE].some(type => type === this.token.type)) {
                ret.push(this.token);
                this.match(this.token.type);
            }
        }
        else {
            while (count > 0 && [scanner_1.TokenType.NUMBER, scanner_1.TokenType.STRING, scanner_1.TokenType.SYMBLE].some(type => type === this.token.type)) {
                ret.push(this.token);
                this.match(this.token.type);
                count--;
            }
            if (count !== 0) {
                throw new Error("No enough arg");
            }
        }
        return ret;
    }
    otherToken(ret) {
        ret.strings.push(this.token.value);
    }
}
exports.Parser = Parser;
