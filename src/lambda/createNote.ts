import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ErrorResponseClass, ResponseClass } from '../utils/ResponsesClass/responses';
import { logger, middleware } from '../middleware/middyValidator';
import { v4 as uuid } from 'uuid';
import { DynamodbClient } from '../utils/dbClient/dbClientInstance';
import { NoteInput } from '../types/global';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { getCacheContext } from '../utils/Contexts/CacheContexts';

const dbClient = DynamodbClient.getInstance();
const createNote = async (
  event: APIGatewayProxyEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> => {
  logger.info(`Event received ${JSON.stringify(event, null, 2)}`);
  logger.info(`Context received ${JSON.stringify(_context, null, 2)}`);
  try {
    const body: NoteInput = event.body as NoteInput;

    logger.info(`Body received ${JSON.stringify(body.notes, null, 2)}`);
    logger.debug(`Request Id of the event ${getCacheContext('x-request-id')}`);

    if (!body.notes || body.notes.length === 0) {
      return ErrorResponseClass.getInstance(400, 'Content is required').getErrorResponse();
    }

    body.notes.forEach((note) => {
      note.createdAt = new Date().getTime().toString();
    });

    const note = {
      noteId: uuid(),
      notes: body.notes,
      createdAt: new Date().getTime().toString(),
      updatedAt: new Date().getTime().toString(),
    };

    const { TableName, Item } = {
      TableName: process.env.TABLE_NAME!,
      Item: note,
    };

    const noteResponse = await dbClient.putItem(TableName, Item);

    logger.info(`Note created successfully ${JSON.stringify(noteResponse, null, 2)}`);

    return ResponseClass.getInstance(
      201,
      'Note has been created Successfully',
      noteResponse as object,
    ).getResponse();
  } catch (error: Error | unknown) {
    logger.error(`Error: ${error}`);
    return ErrorResponseClass.getInstance(500, error.message).getErrorResponse();
  }
};

export const handler = middy(createNote, {
  timeoutEarlyInMillis: 0,
})
  .use(middleware())
  .use(httpJsonBodyParser())
  .use(
    httpErrorHandler({
      fallbackMessage: `Lambda Got timed out after 30 seconds or failed to response. Please check the logs and try again.`,
    }),
  );
