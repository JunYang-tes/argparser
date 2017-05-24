import { Token } from "./types";
export declare class ParserError extends Error {
    private token;
    constructor(token: Token, msg: string);
    getToken(): Token;
}
export declare class ExpectValueError extends ParserError {
    constructor(token: Token);
}
export declare class ExpectNumberError extends ParserError {
    constructor(token: Token);
}
export declare class RequiredError extends Error {
    constructor(option: string);
}
export declare class OutOfRangeError extends ParserError {
    constructor(optionToken: Token, expected: [string | number], got: string | number);
}
export declare class ConvertError extends ParserError {
    constructor(optionToken: Token, error: string);
}
