import { FragmentOf, graphql } from "gql.tada";
import { Resource } from "../models/paging-resource.js";

export const pageInfoFragment = graphql(`
  fragment PageInfoFragment on PageInfo @_unmask {
    total
    perPage
    currentPage
    lastPage
    hasNextPage
  }
`);

export const formatResource = <T>(pageInfo: FragmentOf<typeof pageInfoFragment>, data: T[]): Resource<T> => ({
  data,
  current_page: pageInfo.currentPage!,
  has_next_page: pageInfo.hasNextPage!,
  last_page: pageInfo.lastPage!,
  per_page: pageInfo.perPage!,
  total: pageInfo.total!,
})