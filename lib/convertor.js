"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
function toNumber(value) {
    let ret = Number(value);
    if (Number.isNaN(ret)) {
        throw `${value} is not a number`;
    }
    return ret;
}
exports.toNumber = toNumber;
function toFile(value) {
    if (fs.existsSync(value)) {
        return value;
    }
    throw `No such file ${value}`;
}
exports.toFile = toFile;
function toReadFileStream(value) {
    if (fs.existsSync(value)) {
        return fs.createReadStream(value);
    }
    throw `No such file ${value}`;
}
exports.toReadFileStream = toReadFileStream;
function toWriteFileStream(value) {
    if (fs.existsSync(value)) {
        return fs.createWriteStream(value);
    }
    throw `No such file ${value}`;
}
exports.toWriteFileStream = toWriteFileStream;
function nil(value) {
    return value;
}
exports.nil = nil;
function arrayConvert(fn) {
    return (value) => value.map(v => fn(v));
}
exports.arrayConvert = arrayConvert;
