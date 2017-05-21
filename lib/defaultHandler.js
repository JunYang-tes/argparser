"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const handlers_1 = require("./handlers");
exports.DEFAULT_HANDLER = {
    [types_1.OptionType.LIST]: handlers_1.Appender,
    [types_1.OptionType.NUMBER]: handlers_1.Store,
    [types_1.OptionType.STRING]: handlers_1.Store,
    [types_1.OptionType.ITEM]: handlers_1.Store,
    [types_1.OptionType.SWITCH]: handlers_1.Count
};
