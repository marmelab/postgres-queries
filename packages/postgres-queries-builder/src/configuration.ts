export interface StringMap {
    [s: string]: string | number;
}

export interface Query {
    sql: string;
    parameters: StringMap;
    returnOne: boolean;
}

export type QueryFun = (raw: StringMap | string) => Query;

export default interface Config {
    table: string;
}
