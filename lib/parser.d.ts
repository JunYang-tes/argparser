import { Token, Scanner } from "./scanner";
import { Option, OptionItem } from "./types";
export declare class Parser {
    protected scanner: Scanner;
    protected option: Option;
    protected token: Token;
    constructor(option: Option);
    protected checkOp(option: Option, optionName: string, op: OptionItem): void;
    protected match(...tokenTypes: string[]): void;
    parse(content: string): any;
    protected parseLongOption(ret: any): void;
    protected getTokens(count: number): Token[];
    protected otherToken(ret: any): void;
}
