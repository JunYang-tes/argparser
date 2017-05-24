"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
exports.formatter = {
    [types_1.OptionType.ITEM]: () => {
        return "<arg>";
    },
    [types_1.OptionType.LIST]: () => {
        return "<arg> ...";
    },
    [types_1.OptionType.NUMBER]: () => {
        return "<num>";
    },
    [types_1.OptionType.STRING]: () => {
        return "<string>";
    },
    [types_1.OptionType.SWITCH]: () => {
        return "";
    }
};
