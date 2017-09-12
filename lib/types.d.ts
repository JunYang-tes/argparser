export declare const TokenType: {
    LONG_OPTIONS: string;
    SHORT_OPTION: string;
    NUMBER: string;
    STRING: string;
    SYMBLE: string;
    EOF: string;
};
export interface convert {
    (value: any, option?: Token): any;
}
export interface Token {
    type: string;
    value: string | number;
    line: number;
    column: number;
    pos: number;
}
export declare const OptionType: {
    LIST: string;
    STRING: string;
    NUMBER: string;
    ITEM: string;
    SWITCH: string;
    FILE: string;
};
export interface OptionItem {
    default?: string | number;
    required?: boolean;
    handler?: Handler;
    type?: string;
    help?: string;
    range?: [any];
    convert?: convert;
    genShort?: boolean;
}
export interface Option {
    [idx: string]: OptionItem;
}
export interface Handler {
    name: string;
    expectTokens: number;
    handle: (ret: any, current: Token, ...tokens: Token[]) => void;
}
export interface SubcmdOption {
    [name: string]: Option;
}
export interface SubcmdResult {
    cmd: string;
    result: any;
}
