// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cacheContexts = new Map<string, any>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setCacheContext = (key: string, value: any) => {
  cacheContexts.set(key, value);
};

export const getCacheContext = (key: string) => {
  return cacheContexts.get(key);
};

export const deleteCacheContext = (key: string) => {
  return cacheContexts.delete(key);
};

export const clearCacheContexts = () => {
  return cacheContexts.clear();
};
