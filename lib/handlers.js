"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
exports.Appender = {
    name: "appender",
    expectTokens: -1,
    handle: (ret, current, ...tokens) => {
        let list;
        let option = current.value;
        if (!(option in ret)) {
            list = ret[option] = [];
        }
        else if (!(ret[option] instanceof Array)) {
            list = ret[option] = [ret[option]];
        }
        else {
            list = ret[option];
        }
        tokens.forEach(token => list.push(token.value));
    }
};
exports.Store = {
    name: "store",
    expectTokens: 1,
    handle: (ret, current, token) => {
        ret[current.value.toString()] = token.value;
    }
};
exports.StoreTrue = {
    name: "store-true",
    expectTokens: 0,
    handle: (ret, current) => {
        if (current.type === types_1.TokenType.LONG_OPTIONS) {
            ret[current.value] = true;
        }
        else if (current.type === types_1.TokenType.SHORT_OPTION) {
            for (let ch of current.value) {
                ret[ch] = true;
            }
        }
    }
};
exports.Count = {
    name: "count",
    expectTokens: 0,
    handle: (ret, current) => {
        if (current.type === types_1.TokenType.LONG_OPTIONS) {
            if (current.value in ret) {
                ret[current.value]++;
            }
            else {
                ret[current.value] = 1;
            }
        }
        else if (current.type === types_1.TokenType.SHORT_OPTION) {
            for (let ch of current.value) {
                if (ch in ret) {
                    ret[ch]++;
                }
                else {
                    ret[ch] = 1;
                }
            }
        }
    }
};
