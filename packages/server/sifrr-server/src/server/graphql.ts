import { createAsyncIterator, isAsyncIterable } from 'iterall';
import { AppOptions, WebSocketBehavior } from 'uWebSockets.js';
import { GraphQLArgs, GraphQLSchema, parse as parseGql } from 'graphql';
import * as Graphql from 'graphql';
import { SifrrRequest } from '@/server/types';
import { SifrrResponse } from '@/server/response';
// client -> server
const GQL_START = 'start';
const GQL_STOP = 'stop';
// server -> client
const GQL_DATA = 'data';
const GQL_QUERY = 'query';

declare module 'uWebSockets.js' {
  interface WebSocket<UserData> {
    operations?: {
      [id: number]: { return?: () => void };
    };
  }
}

async function getGraphqlParams(res: SifrrResponse, req: SifrrRequest) {
  // query and variables
  const queryParams = req.query;
  let { query, variables, operationName } = queryParams;
  if (typeof variables === 'string') variables = JSON.parse(variables);

  // body
  const data = await (
    res as SifrrResponse<{
      query: string;
      variables: string;
      operationName: string;
    }>
  ).body;
  if (data) {
    query = ((data.query as string) ?? query)?.toString();
    variables = data.variables ?? variables;
    operationName = data.operationName ?? operationName;
  }
  return {
    source: query as string,
    variableValues: variables as unknown as { readonly [variable: string]: unknown },
    operationName: operationName as string
  };
}

function graphqlPost(
  schema: GraphQLSchema,
  graphqlOptions: Partial<GraphQLArgs>,
  graphqlImpl: typeof Graphql
) {
  const execute = graphqlImpl.graphql || require('graphql').graphql;

  return async (req: SifrrRequest, res: SifrrResponse) => {
    res.json(
      await execute({
        schema,
        ...(await getGraphqlParams(res, req)),
        ...graphqlOptions,
        contextValue: {
          res,
          req,
          ...(graphqlOptions.contextValue as object)
        }
      })
    );
  };
}

function stopGqsSubscription(
  operations?: {
    [id: number]: { return?: () => void };
  },
  reqOpId?: number
) {
  if (!reqOpId || !operations) return;
  operations[reqOpId]?.return?.();
  delete operations[reqOpId];
}

function graphqlWs<T>(
  schema: GraphQLSchema,
  graphqlOptions: Partial<Graphql.ExecutionArgs>,
  uwsOptions: WebSocketBehavior<T>,
  graphql: typeof Graphql
) {
  const subscribe = graphql.subscribe || require('graphql').subscribe;
  const execute = graphql.graphql || require('graphql').graphql;

  const opts: WebSocketBehavior<T> = {
    open: (ws) => {
      ws.operations = {};
    },
    message: async (ws, message) => {
      const { type, payload = {}, id: reqOpId } = JSON.parse(Buffer.from(message).toString('utf8'));

      const params = {
        schema,
        source: payload.query,
        document: parseGql(payload.query),
        variableValues: payload.variables,
        operationName: payload.operationName,
        contextValue: {
          ws,
          ...(graphqlOptions.contextValue as object)
        },
        ...graphqlOptions
      };

      switch (type) {
        case GQL_START:
          stopGqsSubscription(ws.operations, reqOpId);

          // eslint-disable-next-line no-case-declarations
          const result = await subscribe(params);
          // eslint-disable-next-line no-case-declarations
          const asyncIterable = isAsyncIterable(result)
            ? result
            : { [Symbol.asyncIterator]: () => createAsyncIterator([result]) };

          for await (const result of asyncIterable) {
            ws.send(
              JSON.stringify({
                id: reqOpId,
                type: GQL_DATA,
                payload: result
              })
            );
          }
          break;

        case GQL_STOP:
          stopGqsSubscription(ws.operations, reqOpId);
          break;

        default:
          ws.send(JSON.stringify({ payload: await execute(params), type: GQL_QUERY, id: reqOpId }));
          break;
      }
    },
    idleTimeout: 24 * 60 * 60,
    ...uwsOptions
  };

  return opts;
}

export { graphqlPost, graphqlWs };
