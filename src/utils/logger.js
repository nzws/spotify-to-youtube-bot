import chalk from 'chalk';

export const logInfo = (...args) =>
  console.log(chalk.blue('[log]'), `PID:${process.pid}`, ...args);
export const logWarn = (...args) =>
  console.warn(chalk.yellow('[WARN]'), `PID:${process.pid}`, ...args);
export const logError = (...args) =>
  console.error(chalk.red('[ERR]'), `PID:${process.pid}`, ...args);
export const logDebug = (...args) =>
  process.env.NODE_ENV === 'development' ? logInfo(...args) : undefined;

export const catcher = (msg, e) => {
  logError(e);
  return msg.reply('🚨 Unknown Error');
};
