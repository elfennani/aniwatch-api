import {FragmentOf, graphql} from "gql.tada";
import {queryToShow, showFragment} from "./show.js";
import {Relation} from "../models/relation.js";

export const relationFragment = graphql(`
    fragment RelationFragment on MediaEdge @_unmask {
        id
        relationType
        node {
            ...ShowFragment
            status
            format
        }
    }
`, [showFragment])

export const formatRelations = (data: FragmentOf<typeof relationFragment>): Relation => {
    return {
        id: data.id!!,
        relation_type: data.relationType!!,
        format: data.node?.format || undefined,
        show: queryToShow(data.node!!),
        state: data.node?.status || undefined,
    }
}