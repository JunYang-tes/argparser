import { TokenType, Token } from "./types";
export { TokenType, Token };
export declare class Scanner {
    protected cmd: any;
    private tokens;
    constructor();
    protected addRules(): void;
    private toToken(token);
    input(content: string): void;
    next(): Token;
    push(token: Token): void;
}
