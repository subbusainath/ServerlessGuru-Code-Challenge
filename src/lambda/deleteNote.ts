import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ErrorResponseClass, ResponseClass } from '../utils/ResponsesClass/responses';
import { DynamodbClient } from '../utils/dbClient/dbClientInstance';
import { logger, middleware } from '../middleware/middyValidator';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
const dbClient = DynamodbClient.getInstance();

const deleteNote = async (
  event: APIGatewayProxyEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> => {
  logger.info(`Event received ${JSON.stringify(event, null, 2)}`);
  logger.debug(`Context received ${JSON.stringify(_context, null, 2)}`);
  try {
    const { noteId } = event.pathParameters;

    const { TableName, Key } = {
      TableName: process.env.TABLE_NAME!,
      Key: {
        noteId: noteId,
      },
    };

    const response = await dbClient.deleteItem(TableName, Key);

    logger.debug(`Response received ${JSON.stringify(response as object, null, 2)}`);

    return ResponseClass.getInstance(204, 'Notes has been deleted Successfully').getResponse();
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      logger.error(`Error: ${error}`);
      return ErrorResponseClass.getInstance(400, error.message).getErrorResponse();
    }
    logger.error(`Unknown Error: ${error}`);
    return ErrorResponseClass.getInstance(500, error.message).getErrorResponse();
  }
};

export const handler = middy(deleteNote, {
  timeoutEarlyInMillis: 0,
})
  .use(middleware())
  .use(
    httpErrorHandler({
      fallbackMessage:
        'Lambda Got timed out after 30 seconds or failed to response. Please check the logs and try again.',
    }),
  );
