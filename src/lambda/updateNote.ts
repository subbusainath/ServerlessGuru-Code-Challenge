import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ErrorResponseClass, ResponseClass } from '../utils/ResponsesClass/responses';
import { middleware } from '../middleware/middyValidator';
import { logger } from '../utils/LoggerClass/logger';
import { DynamodbClient } from '../utils/dbClient/dbClientInstance';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import { Note } from '../types/global';
const dbClient = DynamodbClient.getInstance();
const updateNote = async (
  event: APIGatewayProxyEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> => {
  logger.info(`Event received ${JSON.stringify(event, null, 2)}`);
  logger.debug(`Context received ${JSON.stringify(_context, null, 2)}`);
  try {
    const { noteId } = event.pathParameters;

    const body = JSON.parse(event.body || '{}') as Note;

    logger.info(`Date received in the body ${body}`);

    if (!body.content && body.content?.length === 0) {
      return ErrorResponseClass.getInstance(400, 'Content is required').getErrorResponse();
    }

    body.createdAt = new Date().getTime().toString();

    const { TableName, Key, UpdateExpression, ExpressionAttributeValues } = {
      TableName: process.env.TABLE_NAME!,
      Key: {
        noteId: noteId,
      },
      UpdateExpression: 'set notes = list_append(notes, :content) , updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':content': [body],
        ':updatedAt': new Date().getTime().toString(),
      },
    };

    const noteResponse: object = await dbClient.updateItem(
      TableName,
      Key,
      UpdateExpression,
      ExpressionAttributeValues,
    );

    logger.info(`Note updated successfully ${JSON.stringify(noteResponse, null, 2)}`);

    return ResponseClass.getInstance(
      200,
      'Note has been updated Successfully',
      noteResponse,
    ).getResponse();
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      logger.error(`Error: ${error}`);
      return ErrorResponseClass.getInstance(400, error.message).getErrorResponse();
    }
    logger.error(`Unknown Error: ${error}`);
    return ErrorResponseClass.getInstance(500, error.message).getErrorResponse();
  }
};

export const handler = middy(updateNote, {
  timeoutEarlyInMillis: 0,
})
  .use(httpJsonBodyParser())
  .use(middleware())
  .use(
    httpErrorHandler({
      fallbackMessage: `Lambda Got timed out after 30 seconds or failed to response. Please check the logs and try again.`,
    }),
  );
