export interface StringMap {
    [s: string]: string | number;
}

export interface AnyMap {
    [s: string]: any;
}

export interface Query {
    sql: string;
    parameters?: StringMap;
    returnOne: boolean;
}

export type SortDir = 'ASC' | 'DESC';

export interface Config {
    table: string;
}
