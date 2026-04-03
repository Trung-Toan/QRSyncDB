const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, context, ...metadata }) => {
    let logMsg = `${timestamp} [${level}]${context ? ` [${context}]` : ''}: ${message}`;
    if (Object.keys(metadata).length > 0) {
      logMsg += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    if (stack) {
      logMsg += `\n${stack}`;
    }
    return logMsg;
  })
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'stack', 'context'] }),
  winston.format.json()
);

const fileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
});
const logger = winston.createLogger({
  level: env === 'development' ? 'debug' : 'info',
  format: env === 'development' ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console({
      format: env === 'development' ? devFormat : prodFormat
    }),
  ],
});
logger.add(fileRotateTransport);
module.exports = logger;