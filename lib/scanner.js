"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
exports.TokenType = types_1.TokenType;
class Scanner {
    constructor() {
        this.tokens = [];
        this.cmd = new Tokenizer();
    }
    input(content) {
        this.cmd.reset(content);
    }
    next() {
        if (this.tokens.length) {
            return this.tokens.pop();
        }
        let token = this.cmd.getToken();
        if (token.type === types_1.TokenType.SHORT_OPTION) {
            let tokens = [];
            let pos = token.pos;
            for (let ch of "" + token.value) {
                tokens.push(Object.assign({}, token, { value: ch, column: pos, pos: pos++ }));
            }
            while (tokens.length) {
                this.tokens.push(tokens.pop());
            }
            return this.tokens.pop();
        }
        else {
            return token;
        }
    }
    push(token) {
        this.tokens.push(token);
    }
}
exports.Scanner = Scanner;
class Tokenizer {
    constructor() {
        this.quotations = ["'", '"', "`"];
        this.escaping = {
            't': '\t',
            'n': '\n',
            'r': '\r',
            '\\': '\\',
            ' ': ' '
        };
    }
    getChar() {
        if (this.idx < this.input.length) {
            return this.input[this.idx++];
        }
        else {
            return "EOL";
        }
    }
    inStart(buffer) {
        let ch = this.getChar();
        if (ch === Tokenizer.EOL) {
            return Tokenizer.END;
        }
        else if (ch === "-") {
            return Tokenizer.DASH;
        }
        else if (/\s/.test(ch)) {
            return Tokenizer.START;
        }
        else if (this.quotations.indexOf(ch) >= 0) {
            this.quotation = ch;
            return Tokenizer.STRING;
        }
        else if (/[\d+.]/.test(ch)) {
            buffer.push(ch);
            return Tokenizer.NUMBER;
        }
        else {
            buffer.push("" + ch);
            return Tokenizer.SYMBOL;
        }
    }
    inDash(buffer) {
        let ch = this.getChar();
        if (ch === Tokenizer.EOL) {
            return Tokenizer.END;
        }
        else {
            if (/\d/.test(ch)) {
                buffer.push("-");
                buffer.push(ch);
                return Tokenizer.NUMBER;
            }
            else if (ch === "-") {
                let next = this.getChar();
                if (/\s/.test(next + "")) {
                    return Tokenizer.OR_STRING;
                }
                else {
                    buffer.push(next);
                    return Tokenizer.LONG_OP;
                }
            }
            else {
                buffer.push(ch);
                return Tokenizer.SORT_OP;
            }
        }
    }
    inNumber(buffer) {
        let ch = this.getChar();
        if (ch === Tokenizer.EOL) {
            return Tokenizer.END;
        }
        else if (/\d/.test(ch)) {
            buffer.push(ch);
            return Tokenizer.NUMBER;
        }
        else if (/\s/.test(ch)) {
            return Tokenizer.END;
        }
        else if (ch === "." && buffer.indexOf(".") < 0) {
            buffer.push(ch);
            return Tokenizer.NUMBER;
        }
        else {
            buffer.push(ch);
            if (buffer[0] === "-") {
                return Tokenizer.SORT_OP;
            }
            else {
                return Tokenizer.SYMBOL;
            }
        }
    }
    inOp(buffer, state) {
        let ch = this.getChar();
        if (ch === Tokenizer.EOL) {
            return Tokenizer.END;
        }
        else if (ch == "\\") {
            let next = this.getChar();
            if (this.escape(buffer, ch, next) === Tokenizer.END) {
                return Tokenizer.END;
            }
            else {
                return state;
            }
        }
        else if (/\s/.test(ch)) {
            return Tokenizer.END;
        }
        else {
            buffer.push(ch);
            return state;
        }
    }
    escape(buffer, curr, next) {
        if (next === Tokenizer.EOL) {
            buffer.push(curr);
            return Tokenizer.END;
        }
        else if (this.quotations.indexOf(next) >= 0) {
            buffer.push(next);
        }
        else if (next in this.escaping) {
            buffer.push(this.escaping[next]);
        }
        else {
            buffer.push(curr);
            buffer.push(next);
        }
    }
    inString(buffer) {
        let ch = this.getChar();
        if (ch == Tokenizer.EOL || ch === this.quotation) {
            return Tokenizer.END;
        }
        else if (ch == "\\") {
            let next = this.getChar();
            if (this.escape(buffer, ch, next) === Tokenizer.END) {
                return Tokenizer.END;
            }
            return Tokenizer.STRING;
        }
        else {
            buffer.push(ch);
            return Tokenizer.STRING;
        }
    }
    getRest() {
        return this.input.slice(this.idx);
    }
    reset(input) {
        this.input = input;
        this.idx = 0;
    }
    getToken() {
        let state = 0;
        let buffer = [];
        let token = {
            type: "",
            value: "",
            line: 1,
            column: 0,
            pos: 0
        };
        while (state !== Tokenizer.END) {
            switch (state) {
                case Tokenizer.START:
                    state = this.inStart(buffer);
                    token.pos = token.column = this.idx - 1;
                    break;
                case Tokenizer.STRING:
                    state = this.inString(buffer);
                    token.type = types_1.TokenType.STRING;
                    break;
                case Tokenizer.DASH:
                    state = this.inDash(buffer);
                    break;
                case Tokenizer.LONG_OP:
                    token.type = types_1.TokenType.LONG_OPTIONS;
                    state = this.inOp(buffer, Tokenizer.LONG_OP);
                    break;
                case Tokenizer.SORT_OP:
                    token.type = types_1.TokenType.SHORT_OPTION;
                    state = this.inOp(buffer, Tokenizer.SORT_OP);
                    break;
                case Tokenizer.NUMBER:
                    token.type = types_1.TokenType.NUMBER;
                    state = this.inNumber(buffer);
                    break;
                case Tokenizer.OR_STRING:
                    buffer.push(this.getRest());
                    state = Tokenizer.END;
                    this.idx = this.input.length;
                    token.type = types_1.TokenType.STRING;
                    break;
                case Tokenizer.SYMBOL:
                    state = this.inOp(buffer, Tokenizer.SYMBOL);
                    token.type = types_1.TokenType.SYMBLE;
                    break;
                default:
                    console.log("unexpected batch");
                    break;
            }
        }
        token.value = buffer.join("");
        if (!token.value.length) {
            token.type = types_1.TokenType.EOF;
        }
        if (token.type === types_1.TokenType.SHORT_OPTION) {
            token.value = token.value.replace(/^-/, "");
        }
        else if (token.type === types_1.TokenType.NUMBER) {
            let num = +token.value;
            if (!Number.isNaN(num)) {
                token.value = num;
            }
        }
        return token;
    }
}
Tokenizer.START = 0;
Tokenizer.END = 1;
Tokenizer.SYMBOL = 2;
Tokenizer.ESCAPE = 3;
Tokenizer.DASH = 4;
Tokenizer.LONG_OP = 5;
Tokenizer.SORT_OP = 6;
Tokenizer.STRING = 7;
Tokenizer.OR_STRING = 8;
Tokenizer.NUMBER = 9;
Tokenizer.EOL = "EOL";
exports.Tokenizer = Tokenizer;
