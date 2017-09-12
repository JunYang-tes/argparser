import { TokenType, Token } from "./types";
export { TokenType, Token };
export declare class Scanner {
    protected cmd: Tokenizer;
    private tokens;
    constructor();
    input(content: string): void;
    next(): Token;
    push(token: Token): void;
}
export declare class Tokenizer {
    static START: number;
    static END: number;
    static SYMBOL: number;
    static ESCAPE: number;
    static DASH: number;
    static LONG_OP: number;
    static SORT_OP: number;
    static STRING: number;
    static OR_STRING: number;
    static NUMBER: number;
    static EOL: string;
    private quotations;
    private input;
    private idx;
    private getChar();
    private escaping;
    private quotation;
    private inStart(buffer);
    private inDash(buffer);
    private inNumber(buffer);
    private inOp(buffer, state);
    private escape(buffer, curr, next);
    private inString(buffer);
    private getRest();
    reset(input: string): void;
    getToken(): Token;
}
