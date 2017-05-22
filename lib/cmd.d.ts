import { Option } from "./types";
export interface Helper {
    usage: string;
    example?: string | [string];
    showOp?: (op: Option, width: number) => void;
}
export declare function cmdParser(op: Option, helper?: Helper): any;
