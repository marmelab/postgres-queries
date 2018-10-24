export interface Literal<T> {
    [key: string]: T;
}

export interface Query {
    sql: string;
    parameters?: Literal<any>;
    returnOne?: boolean;
}

export type SortDir = 'ASC' | 'DESC';

export interface Config {
    table: string;
}

export type filters = Literal<
    string | number | boolean | string[] | number[] | boolean[]
>;
