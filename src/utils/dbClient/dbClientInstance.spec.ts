import { DynamoDB } from 'aws-sdk';
import { DynamodbClient } from './dbClientInstance'; // Adjust the import path as needed
import { logger } from '../LoggerClass/logger'; // Adjust the import path as needed

// Mock the AWS SDK
jest.mock('aws-sdk', () => {
  const mDocumentClient = {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    query: jest.fn(),
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mDocumentClient),
    },
  };
});

// Mock the logger
jest.mock('../LoggerClass/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('DynamodbClient', () => {
  let dynamodbClient: DynamodbClient;
  let mockDocumentClient: jest.Mocked<DynamoDB.DocumentClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    dynamodbClient = DynamodbClient.getInstance();
    mockDocumentClient = new DynamoDB.DocumentClient() as jest.Mocked<DynamoDB.DocumentClient>;
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = DynamodbClient.getInstance();
      const instance2 = DynamodbClient.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getItem', () => {
    it('should return the item when found', async () => {
      const mockItem = { id: '1', name: 'Test Item' };
      mockDocumentClient.get.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockResolvedValue({ Item: mockItem }),
          }) as any,
      );

      const result = await dynamodbClient.getItem('TestTable', { id: '1' });
      expect(result).toEqual(mockItem);
    });

    it('should throw an error when item is not found', async () => {
      mockDocumentClient.get.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockResolvedValue({}),
          }) as any,
      );

      await expect(dynamodbClient.getItem('TestTable', { id: '1' })).rejects.toThrow(
        'Item with key {"id":"1"} not found in the table TestTable',
      );
    });

    it('should throw an error when DynamoDB operation fails', async () => {
      mockDocumentClient.get.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockRejectedValue(new Error('DynamoDB error')),
          }) as any,
      );

      await expect(dynamodbClient.getItem('TestTable', { id: '1' })).rejects.toThrow(
        'DynamoDB error',
      );
      expect(logger.error).toHaveBeenCalledWith(new Error('DynamoDB error'));
    });
  });

  describe('putItem', () => {
    it('should successfully add an item', async () => {
      mockDocumentClient.put.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockResolvedValue({}),
          }) as any,
      );

      const result = await dynamodbClient.putItem('TestTable', { id: '1', name: 'Test Item' });
      expect(result).toBe('Item added successfully to the table TestTable');
    });

    it('should throw an error when DynamoDB operation fails', async () => {
      mockDocumentClient.put.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockRejectedValue(new Error('DynamoDB error')),
          }) as any,
      );

      await expect(
        dynamodbClient.putItem('TestTable', { id: '1', name: 'Test Item' }),
      ).rejects.toThrow('Error adding item to the table TestTable');
      expect(logger.error).toHaveBeenCalledWith(new Error('DynamoDB error'));
    });
  });

  describe('deleteItem', () => {
    it('should successfully delete an item', async () => {
      mockDocumentClient.delete.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockResolvedValue({ Attributes: { id: '1', name: 'Test Item' } }),
          }) as any,
      );

      const result = await dynamodbClient.deleteItem('TestTable', { id: '1' });
      expect(result).toEqual({
        Attributes: { id: '1', name: 'Test Item' },
        name: 'Item deleted successfully from the table',
        message: 'Item deleted successfully from the table TestTable',
      });
    });

    it('should throw an error when item is not found', async () => {
      mockDocumentClient.delete.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockResolvedValue({}),
          }) as any,
      );

      await expect(dynamodbClient.deleteItem('TestTable', { id: '1' })).rejects.toThrow(
        'Item was not found/able to deleted successfully from the table TestTable',
      );
    });

    it('should throw an error when DynamoDB operation fails', async () => {
      mockDocumentClient.delete.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockRejectedValue(new Error('DynamoDB error')),
          }) as any,
      );

      await expect(dynamodbClient.deleteItem('TestTable', { id: '1' })).rejects.toThrow(
        'DynamoDB error',
      );
      expect(logger.error).toHaveBeenCalledWith(new Error('DynamoDB error'));
    });
  });

  describe('updateItem', () => {
    it('should successfully update an item', async () => {
      const updatedItem = { id: '1', name: 'Updated Item' };
      mockDocumentClient.update.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockResolvedValue({ Attributes: updatedItem }),
          }) as any,
      );

      const result = await dynamodbClient.updateItem(
        'TestTable',
        { id: '1' },
        'SET #name = :name',
        { ':name': 'Updated Item' },
      );
      expect(result).toEqual(updatedItem);
    });

    it('should throw an error when update fails', async () => {
      mockDocumentClient.update.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockResolvedValue({}),
          }) as any,
      );

      await expect(
        dynamodbClient.updateItem('TestTable', { id: '1' }, 'SET #name = :name', {
          ':name': 'Updated Item',
        }),
      ).rejects.toThrow('Error updating item from the table TestTable');
    });

    it('should throw an error when DynamoDB operation fails', async () => {
      mockDocumentClient.update.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockRejectedValue(new Error('DynamoDB error')),
          }) as any,
      );

      await expect(
        dynamodbClient.updateItem('TestTable', { id: '1' }, 'SET #name = :name', {
          ':name': 'Updated Item',
        }),
      ).rejects.toThrow('DynamoDB error');
      expect(logger.error).toHaveBeenCalledWith(new Error('DynamoDB error'));
    });
  });

  describe('query', () => {
    it('should successfully query items', async () => {
      const mockItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      mockDocumentClient.query.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockResolvedValue({ Items: mockItems }),
          }) as any,
      );

      const result = await dynamodbClient.query('TestTable', 'id = :id', { ':id': '1' });
      expect(result).toEqual(mockItems);
    });

    it('should return null when DynamoDB operation fails', async () => {
      mockDocumentClient.query.mockImplementation(
        () =>
          ({
            promise: jest.fn().mockRejectedValue(new Error('DynamoDB error')),
          }) as any,
      );

      const result = await dynamodbClient.query('TestTable', 'id = :id', { ':id': '1' });
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(new Error('DynamoDB error'));
    });
  });
});
