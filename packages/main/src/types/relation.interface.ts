export type OnAction =
    "Cascade" |
    "Restrict" |
    "NoAction" |
    "SetNull" |
    "SetDefault"

export interface IRelation {
    name?: string;
    fields?: string[];
    references?: string[];
    onDelete?: OnAction;
    onUpdate?: OnAction;
}