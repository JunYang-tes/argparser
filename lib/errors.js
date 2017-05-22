"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParserError extends Error {
    constructor(token, msg) {
        super(msg);
        this.token = token;
    }
    getToken() {
        return this.token;
    }
}
exports.ParserError = ParserError;
class ExpectValueError extends ParserError {
    constructor(token) {
        super(token, `Option ${token.value} needs one or more argument(s).`);
    }
}
exports.ExpectValueError = ExpectValueError;
class ExpectNumberError extends ParserError {
    constructor(token) {
        super(token, `Option ${token.value} needs a number value`);
    }
}
exports.ExpectNumberError = ExpectNumberError;
class RequiredError extends Error {
    constructor(option) {
        super(`Option ${option} is required.`);
    }
}
exports.RequiredError = RequiredError;
class OutOfRangeError extends ParserError {
    constructor(optionToken, expected, got) {
        super(optionToken, `Expect argument is one of ${expected.join(',')} , but got ${got}`);
    }
}
exports.OutOfRangeError = OutOfRangeError;
