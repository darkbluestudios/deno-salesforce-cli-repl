/**
 * Error Level NONE - meaning no debugs are provided
 */
export const ERROR_LEVEL_NONE = -1;

/**
 * Error Level Basic - meaning logging is mostly only for errors
 */
export const ERROR_LEVEL_BASIC = 0;

/**
 * Error level Detail - meaning detail logs are provided
 */
export const ERROR_LEVEL_DETAILED = 1;

/** 
 * The Environment variable reviewed for TraceLevel
 * (to use for default, if it is not provided on initialization)
 */
export const ENV_CLI_TRACE_LEVEL = 'CLI_TRACE_LEVEL';

type ObjectSignature<O extends object> = {
  [P in keyof O]: O[P]
};



export interface CONSOLE_MOCK {
  info: (message:string, ...rest:string[]) => void;
  error: (message:string, ...rest:string[]) => void;
}

export const LOGGER:CONSOLE_MOCK = {
  info: console.log,
  error: console.error
}

/**
 * Represents an error that has an internal and external message
 */
export default class DeveloperError extends Error {
  /** Client Readable message */
  // message:string;

  /** Debug level message */
  detailedMessage:string;

  /** Stack Trace */
  stackTrace:string;

  /**
   * @param {string} message - the client readable message
   * @param {string} detailedMessage - the debug level message
   * @param {string} [stackTrace=''] - the stack trace
   */
  constructor(message:string, detailedMessage:string, stackTrace:string = '') {
    super(message, { cause: stackTrace })
    // this.message = message;
    this.detailedMessage = detailedMessage;
    this.stackTrace = stackTrace;
  }

  /**
   * Creates a Developer Error from a standard error
   */
  static importError(err:Error | DeveloperError):DeveloperError {
    if (err instanceof DeveloperError) return err;

    return new DeveloperError(err.message, 'unhandled exception occurred', err.stack);
  }

  /**
   * Logs the message based on the trace level
   * @param {number} traceLevel - the trace level to show the error from
   * @param {string} message - the message to trace
   * @param {number} [baseLogLevel = ERROR_LEVEL_BASIC] - the minimum log level to have to show the message
   */
  static info(traceLevel:number, message:string, baseLogLevel = ERROR_LEVEL_BASIC):void {
    if (traceLevel >= baseLogLevel) {
      LOGGER.info(message);
    }
  }

  /**
   * Logs the message based on the trace level
   * @param {number} traceLevel - the trace level to show the error from
   */
  log(traceLevel:number):void {
    if (traceLevel > ERROR_LEVEL_NONE) {
      if (traceLevel === ERROR_LEVEL_BASIC) {
        LOGGER.error('Error occurred:', this.message);
      } else if (traceLevel > ERROR_LEVEL_BASIC) {
        LOGGER.error('Error occurred:%s \n %s \n %o', this.message, '\n\n', this.detailedMessage, '\n\n', this.stackTrace);
      }
    }
  }
}
