
import pino from 'pino';
import * as dotenv from 'dotenv'
dotenv.config();

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});


