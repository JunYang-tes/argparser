import { Token, Scanner } from "./scanner";
import { Option, OptionItem } from "./types";
export declare class Parser {
    protected scanner: Scanner;
    protected token: Token;
    constructor();
    protected match(...tokenTypes: string[]): void;
    parse(content: string): any;
    protected parseOption(ret: any): void;
    protected getTokens(count: number): Token[];
    protected otherToken(ret: any): void;
}
export declare class GuessParser extends Parser {
    constructor();
    protected parseOption(ret: any): void;
}
export declare class SpecifiedParser extends Parser {
    protected option: Option;
    protected shortToLong: {
        [idx: string]: string;
    };
    constructor(option: Option);
    protected checkOp(option: Option, optionName: string, op: OptionItem): void;
    parse(content: string): any;
    protected parseOption(ret: any): void;
    protected otherToken(ret: any): void;
}
