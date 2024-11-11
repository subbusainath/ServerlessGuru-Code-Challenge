import {
  setCacheContext,
  getCacheContext,
  deleteCacheContext,
  clearCacheContexts,
} from './CacheContexts';

describe('Cache Context Utility Tests', () => {
  beforeEach(() => {
    // Clear all cache contexts before each test
    clearCacheContexts();
  });

  describe('setCacheContext', () => {
    it('should store string value in cache', () => {
      const key = 'testKey';
      const value = 'testValue';

      setCacheContext(key, value);
      expect(getCacheContext(key)).toBe(value);
    });

    it('should store object value in cache', () => {
      const key = 'objectKey';
      const value = { name: 'John', age: 30 };

      setCacheContext(key, value);
      expect(getCacheContext(key)).toEqual(value);
    });

    it('should override existing value for same key', () => {
      const key = 'overrideKey';
      const initialValue = 'initial';
      const newValue = 'updated';

      setCacheContext(key, initialValue);
      setCacheContext(key, newValue);
      expect(getCacheContext(key)).toBe(newValue);
    });

    it('should store multiple key-value pairs', () => {
      const pairs = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: { nested: 'value3' } },
      ];

      pairs.forEach(({ key, value }) => setCacheContext(key, value));
      pairs.forEach(({ key, value }) => expect(getCacheContext(key)).toEqual(value));
    });
  });

  describe('getCacheContext', () => {
    it('should return undefined for non-existent key', () => {
      expect(getCacheContext('nonExistentKey')).toBeUndefined();
    });

    it('should return correct value for existing key', () => {
      const key = 'existingKey';
      const value = 'existingValue';

      setCacheContext(key, value);
      expect(getCacheContext(key)).toBe(value);
    });

    it('should handle different value types', () => {
      const testCases = [
        { key: 'stringKey', value: 'string value' },
        { key: 'numberKey', value: 42 },
        { key: 'booleanKey', value: true },
        { key: 'objectKey', value: { test: 'object' } },
        { key: 'arrayKey', value: [1, 2, 3] },
        { key: 'nullKey', value: null },
      ];

      testCases.forEach(({ key, value }) => {
        setCacheContext(key, value);
        expect(getCacheContext(key)).toEqual(value);
      });
    });
  });

  describe('deleteCacheContext', () => {
    it('should return true when deleting existing key', () => {
      const key = 'deleteKey';
      const value = 'deleteValue';

      setCacheContext(key, value);
      expect(deleteCacheContext(key)).toBe(true);
      expect(getCacheContext(key)).toBeUndefined();
    });

    it('should return false when deleting non-existent key', () => {
      expect(deleteCacheContext('nonExistentKey')).toBe(false);
    });

    it('should only delete specified key', () => {
      const key1 = 'key1';
      const key2 = 'key2';
      const value1 = 'value1';
      const value2 = 'value2';

      setCacheContext(key1, value1);
      setCacheContext(key2, value2);

      deleteCacheContext(key1);

      expect(getCacheContext(key1)).toBeUndefined();
      expect(getCacheContext(key2)).toBe(value2);
    });
  });

  describe('clearCacheContexts', () => {
    it('should remove all cached values', () => {
      const testData = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
      ];

      testData.forEach(({ key, value }) => setCacheContext(key, value));
      clearCacheContexts();

      testData.forEach(({ key }) => {
        expect(getCacheContext(key)).toBeUndefined();
      });
    });

    it('should work when cache is empty', () => {
      expect(() => clearCacheContexts()).not.toThrow();
    });

    it('should allow setting new values after clearing', () => {
      const key = 'newKey';
      const value = 'newValue';

      setCacheContext('oldKey', 'oldValue');
      clearCacheContexts();
      setCacheContext(key, value);

      expect(getCacheContext(key)).toBe(value);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string key', () => {
      const key = '';
      const value = 'emptyKeyValue';

      setCacheContext(key, value);
      expect(getCacheContext(key)).toBe(value);
    });

    it('should handle undefined value', () => {
      const key = 'undefinedKey';
      const value = undefined;

      setCacheContext(key, value);
      expect(getCacheContext(key)).toBeUndefined();
    });

    it('should handle special characters in keys', () => {
      const testCases = [
        { key: '!@#$%^&*()', value: 'special1' },
        { key: '../../path', value: 'special2' },
        { key: 'key with spaces', value: 'special3' },
        { key: 'emoji🔑', value: 'special4' },
      ];

      testCases.forEach(({ key, value }) => {
        setCacheContext(key, value);
        expect(getCacheContext(key)).toBe(value);
      });
    });
  });
});
