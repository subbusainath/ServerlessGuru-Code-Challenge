import { DynamoDB } from 'aws-sdk';
import { logger } from '../LoggerClass/logger';

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

  public getItem = async (
    tableName: string,
    key: Record<string, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<DynamoDB.DocumentClient.GetItemOutput> => {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: tableName,
      Key: key,
    };
    try {
      const getItemResponse: DynamoDB.DocumentClient.GetItemOutput = await this.ddbClient
        .get(params)
        .promise();
      if (getItemResponse && getItemResponse?.Item) {
        return getItemResponse.Item;
      }
      throw new Error(`Item with key ${JSON.stringify(key)} not found in the table ${tableName}`);
    } catch (error) {
      logger.error(error);
      throw new Error(error);
    }
  };

  public putItem = async (
    tableName: string,
    item: Record<string, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<string | Error> => {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: tableName,
      Item: item,
    };
    try {
      await this.ddbClient.put(params).promise();
      return `Item added successfully to the table ${tableName}`;
    } catch (error) {
      logger.error(error);
      throw new Error(`Error adding item to the table ${tableName}`);
    }
  };

  public deleteItem = async (
    tableName: string,
    key: Record<string, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<string | Error> => {
    const params: DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: tableName,
      Key: key,
      ReturnValues: 'ALL_OLD',
    };
    try {
      const deleteResponse = await this.ddbClient.delete(params).promise();
      if (deleteResponse?.Attributes) {
        return {
          ...deleteResponse,
          message: `Item deleted successfully from the table ${tableName}`,
        };
      } else {
        throw new Error(
          `Item was not found/able to deleted successfully from the table ${tableName}`,
        );
      }
    } catch (error) {
      logger.error(error);
      throw new Error(error);
    }
  };

  public updateItem = async (
    tableName: string,
    key: Record<string, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
    updateExpression: string,
    expressionAttributeValues: Record<string, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<DynamoDB.DocumentClient.UpdateItemOutput | Error> => {
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };
    try {
      const updateResponse: DynamoDB.DocumentClient.UpdateItemOutput = await this.ddbClient
        .update(params)
        .promise();
      return updateResponse?.Attributes;
    } catch (error) {
      logger.error(error);
      throw new Error(`Error updating item from the table ${tableName}`);
    }
  };

  public query = async (
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, any>, //eslint-disable-line @typescript-eslint/no-explicit-any
  ) => {
    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };
    try {
      const queryResponse = await this.ddbClient.query(params).promise();
      return queryResponse.Items;
    } catch (error) {
      logger.error(error);
      return null;
    }
  };
}
