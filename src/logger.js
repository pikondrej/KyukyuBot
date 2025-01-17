/*
 * Logger
 **/

import {join as joinPath} from 'path';
import {truncateSync, createWriteStream} from 'fs';

import {clientConfig} from './app-config.js';
const clientDataPath = clientConfig['client-data-dir'];

/**
 * Log entry
 * @typedef {Object} LogEntry
 * @property {string} summary Log summary
 * @property {string} [details] Log details
 * @property {Date} [time] Entry time
 */

/** Logger class */
class Logger {
  /** Constructor */
  constructor() {
    this.fileStreams = new Map();
    this.openLogBook('client.log'); // General log
    this.openLogBook('client.error'); // Error log
    this.openLogBook('servers.log'); // Server join/leave records
  }

  /**
   * Open a log book
   * @param {string} log - Log file name
   * @return {stream}
   */
  openLogBook(log) {
    const {fileStreams} = this;
    if (!fileStreams.has(log)) {
      const logFilePath = joinPath(clientDataPath, log);
      const stream = createWriteStream(logFilePath, {flags: 'a'});
      fileStreams.set(log, stream);
      return stream;
    } else {
      return fileStreams.get(log);
    }
  }

  /**
   * Get the stream of a log book
   * @param {string} log - Log file name
   * @return {stream}
   */
  getLogStream(log) {
    const {fileStreams} = this;
    if (!fileStreams.has(log)) this.openLogBook(log);
    return fileStreams.get(log);
  }

  /**
   * Write a log entry
   * @param {string} log - Log file name
   * @param {LogEntry|string} entry
   */
  writeLog(log, entry) {
    const logStream = this.getLogStream(log);
    if (typeof entry === 'string') {
      const ts =(new Date()).toISOString();
      if (!entry.endsWith('\n')) entry = entry + '\n';
      logStream.write(`${ts}\t${entry}`);
    } else {
      const t = (entry.time instanceof Date)?(entry.time):(new Date());
      const ts = t.toISOString();
      logStream.write(`${ts}\t${entry.summary}\n`);
      if (entry.details) {
        logStream.write(
            entry.details
                .toString().split('\n')
                .reduce((all, line) => all + `${ts}\t  ${line}\n`, ''),
        );
      }
    }
  }

  /**
   * Clear a log book
   * @param {string} log - Log file name
   */
  clearLog(log) {
    if (this.fileStreams.has(log)) {
      truncateSync(this.fileStreams.get(log).path, 0);
    }
  }

  /** Clear all log */
  clearAllLog() {
    this.fileStreams.forEach((stream) => truncateSync(stream.path, 0));
  }

  /**
   * Get file path of a log book
   * @param {string} log - Log file name
   * @return {string}
   */
  getLogPath(log) {
    if (this.fileStreams.has(log)) {
      return this.fileStreams.get(log).path;
    }
    return '';
  }
}

export const logger = new Logger();
