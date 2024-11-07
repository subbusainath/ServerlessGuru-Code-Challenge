import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import {ErrorResponseClass, ResponseClass} from "../utils/ResponsesClass/responses";
import middyValidator from "../middleware/middyValidator";
import {v4 as uuid } from "uuid"
import { DynamodbClient } from "../utils/dbClient/dbClientInstance"
const dbClient = DynamodbClient.getInstance()
const createNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`Event received ${JSON.stringify(event, null, 2)}`)

    try{
        const body = JSON.parse(event.body || '{}')

        if (!body.content || body.content.length === 0) {
            return ErrorResponseClass.getInstance(
                400,
                "Content is required"
            ).getErrorResponse()
        }

        const note = {
            id: uuid(),
            content: body.content,
            createdAt: new Date().getTime().toString(),
            updatedAt: new Date().getTime().toString()
        }

        const params = {
            TableName: process.env.TABLE_NAME!,
            Item: note
        }

        const noteResponse = await dbClient.putItem(...params)

        return ResponseClass.getInstance(
            201,
            "Note has been created Successfully",
            noteResponse as object).getResponse()

    } catch(error: Error | any) {
        console.log(`Error: ${error}`)
        return ErrorResponseClass.getInstance(
            500,
            error.message).
        getErrorResponse()
    }
}

exports.handler = middyValidator(createNote);