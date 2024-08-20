import {Show} from "./show.js";

export interface Relation {
    id: number;
    relation_type: string,
    format?: string,
    state?: string,
    show: Show
}