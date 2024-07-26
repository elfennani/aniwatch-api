import { graphql } from "gql.tada";
import { GraphQLClient } from "graphql-request";

export const fetchViewerId = async (client: GraphQLClient) => (await client.request(viewer_query)).Viewer?.id

const viewer_query = graphql(`
  query ViewerQuery {
    Viewer {
      id
    }
  }
`);