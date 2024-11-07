import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import {ErrorResponseClass, ResponseClass} from "../utils/ResponsesClass/responses";
import middyValidator from "../middleware/middyValidator";
import { DynamodbClient } from "../utils/dbClient/dbClientInstance";
const dbClient = DynamodbClient.getInstance()
const updateNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`Event received ${JSON.stringify(event, null, 2)}`)

    try{
        const { noteId } = event.pathParameters

        const body = JSON.parse(event.body || '{}')

        if (!body.content || body.content.length === 0) {
            return ErrorResponseClass.getInstance(
                400,
                "Content is required"
            ).getErrorResponse()
        }

        const params = {
            TableName: process.env.TABLE_NAME!,
            Key: {
                notesId: noteId
            },
            UpdateExpression: "set content = :content, updatedAt = :updatedAt",
            ExpressionAttributeValues: {
                ":content": body.content,
                ":updatedAt": new Date().getTime().toString()
            },
        }

        const noteResponse = await dbClient.updateItem(...params)

        return ResponseClass.getInstance(
            200,
            "Note has been updated Successfully",
            noteResponse as object).getResponse()

    } catch(error: Error | any) {
        console.log(`Error: ${error}`)
        return ErrorResponseClass.getInstance(
            500,
            error.message).
        getErrorResponse()
    }
}

exports.handler = middyValidator(updateNote);