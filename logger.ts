import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp}--<${label}>--[${level}] ==> "${message}"`;
});

/**
 * Returns a default logger with the specified label.
 *
 * @param {string} labelName - The label to be added to the logger.
 * @return {Logger} The default logger with the specified label.
 */
export const defaultLogger = (labelName: string) => {
  let logger = createLogger({
    format: combine(
      label({ label: labelName }),
      timestamp(),
      myFormat
    ),
    transports: [new transports.Console()],
  });
  return logger;
};
