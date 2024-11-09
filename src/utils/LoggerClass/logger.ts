import { Logger } from '@aws-lambda-powertools/logger';
import { logLevelType } from '../../types/global';

class LoggerService {
  private static instance: Logger;
  public static getInstance(): Logger {
    if (!LoggerService.instance) {
      const logLevel = process.env.LOG_LEVEL! as logLevelType;
      LoggerService.instance = new Logger({
        serviceName: 'Notes-App-API-Service',
        logLevel,
      });
    }
    return LoggerService.instance;
  }
}

export const logger = LoggerService.getInstance();
