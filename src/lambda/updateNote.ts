import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"
import {ErrorResponseClass, ResponseClass} from "../utils/ResponsesClass/responses";
import { logger, middleware } from "../middleware/middyValidator";
import { DynamodbClient } from "../utils/dbClient/dbClientInstance";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import {Note} from "../types/global";
const dbClient = DynamodbClient.getInstance()
const updateNote = async (event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> => {
    logger.info(`Event received ${JSON.stringify(event, null, 2)}`)
    logger.debug(`Context received ${JSON.stringify(_context, null, 2)}`)
    try{
        const { noteId } = event.pathParameters

        const body = event.body as Note

        if (!body.content || body.content?.length === 0 && !body.createdAt || body.createdAt?.length === 0) {
            return ErrorResponseClass.getInstance(
                400,
                "Content & CreatedAt is required"
            ).getErrorResponse()
        }

        body.createdAt = new Date().getTime().toString()

        const { TableName, Key, UpdateExpression, ExpressionAttributeValues } = {
            TableName: process.env.TABLE_NAME!,
            Key: {
                noteId: noteId
            },
            UpdateExpression: "set notes = list_append(notes, :content) , updatedAt = :updatedAt",
            ExpressionAttributeValues: {
                ":content": [body],
                ":updatedAt": new Date().getTime().toString()
            }
        }

        const noteResponse: object = await dbClient.updateItem(TableName, Key, UpdateExpression, ExpressionAttributeValues)

        logger.info(`Note updated successfully ${JSON.stringify(noteResponse, null, 2)}`)

        return ResponseClass.getInstance(
            200,
            "Note has been updated Successfully",
            noteResponse).getResponse()

    } catch(error: Error | any) {
        logger.error(`Error: ${error}`)
        if (error instanceof Error) {
            return ErrorResponseClass.getInstance(
                400,
                error.message).
            getErrorResponse()
        }
        return ErrorResponseClass.getInstance(
            500,
            error.message).
        getErrorResponse()
    }
}

export const handler = middy(updateNote, {
    timeoutEarlyInMillis: 0
}).use(httpJsonBodyParser()).use(middleware()).use(httpErrorHandler({
    fallbackMessage: `Lambda got timed out after 30 seconds. Please check your Lambda function and try again.`,
}))