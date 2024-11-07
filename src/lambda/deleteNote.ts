import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import {ErrorResponseClass, ResponseClass} from "../utils/ResponsesClass/responses";
import { DynamodbClient } from "../utils/dbClient/dbClientInstance"
import middyValidator from "../middleware/middyValidator";
const dbClient = DynamodbClient.getInstance()

const deleteNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`Event received ${JSON.stringify(event, null, 2)}`)

    try{
        const { noteId } = event.pathParameters

        if (!noteId) {
            return ErrorResponseClass.getInstance(
                400,
                "Note Id is required").
            getErrorResponse()
        }

        const params = {
            TableName: process.env.NOTES_TABLE!,
            Key: {
                notesId: noteId
            }
        }

        const response = await dbClient.deleteItem(...params)


        return ResponseClass.getInstance(
            204,
            "Notes has been deleted Successfully",
            response as object).getResponse()

    } catch(error: Error | any) {
        console.log(`Error: ${error}`)
        return ErrorResponseClass.getInstance(
            500,
            error.message).
        getErrorResponse()
    }
}

exports.handler = middyValidator(deleteNote)