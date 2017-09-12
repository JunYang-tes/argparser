"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scanner_1 = require("./scanner");
const types_1 = require("./types");
const handlers_1 = require("./handlers");
const defaultHandler_1 = require("./defaultHandler");
const defaultConvertor_1 = require("./defaultConvertor");
const convertor_1 = require("./convertor");
const IDebug = require("debug");
const errors_1 = require("./errors");
let debug = IDebug("parser");
class Parser {
    constructor() {
        this.scanner = new scanner_1.Scanner();
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
                    this.parseOption(ret);
                    break;
                case scanner_1.TokenType.LONG_OPTIONS:
                    this.parseOption(ret);
                    break;
                default:
                    this.otherToken(ret);
                    break;
            }
        }
        return ret;
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
                throw "need_argument";
            }
        }
        return ret;
    }
    otherToken(ret) {
        ret.strings.push(this.token.value);
        this.match(this.token.type);
    }
}
exports.Parser = Parser;
class GuessParser extends Parser {
    constructor() {
        super();
    }
    parseOption(ret) {
        let option = this.token.value.toString();
        if (option.length === 1) {
            ret[option] = Number.isFinite(ret[option]) ? ret[option] + 1 : 1;
            this.match(this.token.type);
        }
        else {
            let values = this.getTokens(-1);
            if (values.length === 0) {
                ret[option] = Number.isFinite(ret[option]) ? ret[option] + 1 : 1;
            }
            else if (values.length === 1) {
                if (ret[option] instanceof Array) {
                    ret[option].push(values[0].value);
                }
                else {
                    ret[option] = values[0].value;
                }
            }
            else {
                if (ret[option] !== undefined) {
                    ret[option] = values.map(v => v.value).concat(ret[option]);
                }
                else {
                    ret[option] = values.map(v => v.value);
                }
            }
        }
    }
}
exports.GuessParser = GuessParser;
class SpecifiedParser extends Parser {
    constructor(option) {
        super();
        this.shortToLong = {};
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
        if (!op.convert) {
            op.convert = (op.type in defaultConvertor_1.DEFAULT_CONVERT) ?
                defaultConvertor_1.DEFAULT_CONVERT[op.type] : convertor_1.nil;
        }
        if (op.type === types_1.OptionType.ITEM && !(op.range instanceof Array)) {
            throw new Error(`Option ${optionName} is an item type option,you must specify a range to tell parse which value can be option`);
        }
        if (optionName.length > 1 && op.genShort) {
            let shortName = optionName[0];
            this.shortToLong[shortName] = optionName;
            if (shortName in option) {
                throw new Error(`There is already a ${shortName} in options`);
            }
            else {
                option[shortName] = op;
            }
        }
    }
    parse(content) {
        let ret = super.parse(content);
        for (let short of Object.keys(this.shortToLong)) {
            let long = this.shortToLong[short];
            if (short in ret) {
                ret[long] = ret[short];
            }
            else if (long in ret) {
                ret[short] = ret[long];
            }
            else if (this.option[long].required) {
                throw new errors_1.RequiredError(long);
            }
        }
        for (let opName of Object.keys(this.option)) {
            let op = this.option[opName];
            if ("default" in op && !(opName in ret)) {
                ret[opName] = op.default;
            }
            if (op.required && !(opName in ret)) {
                throw new errors_1.RequiredError(opName.length > 1 ? opName : this.shortToLong[opName]);
            }
        }
        return ret;
    }
    parseOption(ret) {
        let current = this.token;
        let optionItem = this.option[this.token.value];
        if (!optionItem) {
            debug(`Ignore unknow option ${this.token.value}`);
            this.match(this.token.type);
            return;
        }
        let tokens;
        try {
            tokens = this.getTokens(optionItem.handler.expectTokens);
        }
        catch (e) {
            if (e === "need_argument")
                throw new errors_1.ExpectValueError(current);
        }
        optionItem.handler.handle(ret, current, ...tokens);
        if (optionItem.type === types_1.OptionType.ITEM
            && optionItem.range.indexOf(tokens[0].value) < 0) {
            throw new errors_1.OutOfRangeError(current, optionItem.range, tokens[0].value);
        }
        try {
            ret[current.value] = optionItem.convert(ret[current.value]);
        }
        catch (e) {
            let err = e instanceof Error ? e.message : e;
            throw new errors_1.ConvertError(tokens[0] || current, err);
        }
    }
    otherToken(ret) {
        ret.strings.push(this.token.value);
        this.match(this.token.type);
    }
}
exports.SpecifiedParser = SpecifiedParser;
