"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lexor = require("lexor");
const types_1 = require("./types");
exports.TokenType = types_1.TokenType;
class Scanner {
    constructor() {
        this.tokens = [];
        this.cmd = new Lexor();
        this.cmd.rule(/\s/, (ctx) => ctx.ignore());
        this.addRules();
        this.cmd.rule(/[^\s]+/, (ctx) => ctx.accept("symble"));
    }
    addRules() {
        this.cmd.rule(/--[a-zA-Z][a-zA-Z\-0-9]+/, (ctx, [matched]) => ctx.accept("long-option", matched.substr(2)));
        this.cmd.rule(/-[^\d]?[a-zA-Z0-9]+/, (ctx, [matched]) => {
            for (let ch of matched.substr(1)) {
                ctx.accept("short-option", ch);
            }
        });
        this.cmd.rule(/-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.\d+)/, (ctx, [matched]) => ctx.accept("number", Number(matched)));
        this.cmd.rule(/-?\d+/, (ctx, [matched]) => ctx.accept("number", Number(matched)));
        this.cmd.rule(/"((?:\\"|[^\r\n]+)+)"/, (ctx, [mached]) => ctx.accept("string", mached.slice(1, -1)
            .replace(/\\\\/, '\\')
            .replace(/\\"/, '"')));
        this.cmd.rule(/--\s.*/, (ctx, [mached]) => {
            ctx.accept("string", mached.replace(/--\s/, ""));
        });
    }
    toToken(token) {
        return {
            type: token.type,
            value: token.value,
            line: token.line,
            column: token.column,
            pos: token.pos
        };
    }
    input(content) {
        this.cmd.input(content);
    }
    next() {
        if (this.tokens.length) {
            return this.tokens.pop();
        }
        return this.toToken(this.cmd.token());
    }
    push(token) {
        this.tokens.push(token);
    }
}
exports.Scanner = Scanner;
