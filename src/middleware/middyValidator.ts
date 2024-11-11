import { z } from 'zod';
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  clearCacheContexts,
  deleteCacheContext,
  getCacheContext,
  setCacheContext,
} from '../utils/Contexts/CacheContexts';
import { logger } from '../utils/LoggerClass/logger';

const notesSchema = z.object({
  notes: z.array(
    z.object({
      userId: z.string().min(1).max(100),
      content: z.string().min(1).max(1000),
      createdAt: z.string().optional(),
    }),
  ),
});

const updateNoteSchema = z.object({
  userId: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  createdAt: z.string().optional(),
});

const validationErrorHandler = (error: Error) => {
  logger.error(`Validation Error: ${error?.message}`);
  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'Invalid request body' }),
  };
};

const middleware = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    request,
  ) => {
    if (['POST', 'PUT'].includes(request.event.httpMethod)) {
      const body = request.event.body;
      setCacheContext('x-request-id', request.event.requestContext.requestId);
      if (!body) {
        logger.info(`Request Id of the event inside if block ${getCacheContext('x-request-id')}`);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Request body is required' }),
        } as APIGatewayProxyResult;
      }

      try {
        const validatedBody =
          request.event.httpMethod === 'POST'
            ? notesSchema.parse(body)
            : updateNoteSchema.parse(body);
        request.event.body = JSON.stringify(validatedBody);
        logger.debug(`Parsed body: ${JSON.stringify(validatedBody)}`);
        logger.debug(`Request Id of the event ${getCacheContext('x-request-id')}`);
        logger.debug(`Request Id of the event ${getCacheContext('x-request-id')}`);
      } catch (error) {
        logger.error(`Error: ${error}`);
        return validationErrorHandler(error as Error);
      }
    }

    if (request.event.httpMethod === 'GET' || request.event.httpMethod === 'DELETE') {
      const path = request.event?.pathParameters?.noteId;
      if (!path) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Path Parameter  is required' }),
        } as APIGatewayProxyResult;
      }
      setCacheContext('x-request-id', request.event.requestContext.requestId);
      setCacheContext('noteId', path);
    }
  };

  const after: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async () => {
    deleteCacheContext('x-request-id');
    clearCacheContexts();
  };

  const onError: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    request,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error('Error:', request?.error as any);
    logger.error(`Request Id of the event ${getCacheContext('x-request-id')}`);
    request.response = {
      statusCode: 500,
      body: JSON.stringify({
        requestId: getCacheContext('x-request-id'),
        error: 'Internal Server Error',
      }),
    } as APIGatewayProxyResult;
  };

  return {
    before,
    after,
    onError,
  };
};

export { middleware, notesSchema, updateNoteSchema };
