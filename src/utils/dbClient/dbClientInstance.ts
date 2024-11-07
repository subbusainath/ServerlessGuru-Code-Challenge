import { DynamoDB } from "aws-sdk"
export class DynamodbClient {
    private static instance: DynamodbClient;
    private ddbClient: DynamoDB.DocumentClient;
    private constructor() {
        this.ddbClient = new DynamoDB.DocumentClient();
    }
    public static getInstance(): DynamodbClient {
        if (!DynamodbClient.instance) {
            DynamodbClient.instance = new DynamodbClient();
        }
        return DynamodbClient.instance;
    }

    public getItem = async(tableName: string, key: Record<string, any>) => {
        const params : DynamoDB.DocumentClient.GetItemInput = {
            TableName: tableName,
            Key: key
        }
        try {
            const getItemResponse = await this.ddbClient.get(params).promise();
            return getItemResponse.Item;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    public putItem = async(tableName: string, item: Record<string, any>) => {
        const params : DynamoDB.DocumentClient.PutItemInput = {
            TableName: tableName,
            Item: item
        }
        try {
            await this.ddbClient.put(params).promise();
            return `Item added successfully to the table ${tableName}`;
        } catch (error) {
            console.log(error);
            throw new Error(`Error adding item to the table ${tableName}`);
        }
    }

    public deleteItem = async(tableName: string, key: Record<string, any>) => {
        const params : DynamoDB.DocumentClient.DeleteItemInput = {
            TableName: tableName,
            Key: key
        }
        try {
            await this.ddbClient.delete(params).promise();
            return `Item deleted successfully from the table ${tableName}`;
        } catch (error) {
            console.log(error);
            throw new Error(`Error deleting item from the table ${tableName}`);
        }
    }

    public updateItem = async(tableName: string, key: Record<string, any>, updateExpression: string, expressionAttributeValues: Record<string, any>) => {
        const params : DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: tableName,
            Key: key,
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "UPDATED_NEW"
        }
        try {
            await this.ddbClient.update(params).promise();
            return `Item updated successfully from the table ${tableName}`;
        } catch (error) {
            console.log(error);
            throw new Error(`Error updating item from the table ${tableName}`);
        }
    }

    public query = async(tableName: string, keyConditionExpression: string, expressionAttributeValues: Record<string, any>) => {
        const params : DynamoDB.DocumentClient.QueryInput = {
            TableName: tableName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues
        }
        try {
            const queryResponse = await this.ddbClient.query(params).promise();
            return queryResponse.Items;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

