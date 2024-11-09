import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ErrorResponseClass, ResponseClass } from '../utils/ResponsesClass/responses';
import { DynamodbClient } from '../utils/dbClient/dbClientInstance';
import middy from '@middy/core';
import { middleware, logger } from '../middleware/middyValidator';
import httpErrorHandler from '@middy/http-error-handler';
import { NoteOutput } from '../types/global';

const dbClient = DynamodbClient.getInstance();

const getNote = async (
  event: APIGatewayProxyEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> => {
  logger.info(`Event received ${JSON.stringify(event, null, 2)}`);
  logger.info(`Context received ${JSON.stringify(_context, null, 2)}`);

  try {
    const { noteId } = event.pathParameters;

    const { TableName, Key } = {
      TableName: process.env.TABLE_NAME!,
      Key: {
        noteId: noteId,
      },
    };

    logger.debug(`Destructured TableName: ${TableName} and Key: ${JSON.stringify(Key, null, 2)}`);

    const note = await dbClient.getItem(TableName, Key);

    logger.info(`Fetched Note: ${JSON.stringify(note as NoteOutput, null, 2)}`);

    return ResponseClass.getInstance(
      200,
      'Notes has been fetched Successfully',
      note,
    ).getResponse();
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      logger.error(`Error: ${error}`);
      return ErrorResponseClass.getInstance(404, error.message).getErrorResponse();
    }
    logger.error(`Unknown Error: ${error}`);
    return ErrorResponseClass.getInstance(500, error.message).getErrorResponse();
  }
};

export const handler = middy(getNote, {
  timeoutEarlyInMillis: 0,
})
  .use(middleware())
  .use(
    httpErrorHandler({
      fallbackMessage: `Lambda Got timed out after 30 seconds or failed to response. Please check the logs and try again.`,
    }),
  );
