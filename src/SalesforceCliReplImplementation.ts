import * as jsForce from 'jsforce';
import { load } from "@std/dotenv";

import type { Connection } from 'jsforce';

import DeveloperError from './DeveloperError.ts';
import {
  /**
   * Error Level Basic - meaning logging is mostly only for errors
   */
  ERROR_LEVEL_BASIC,

  /**
   * Error level Detail - meaning detail logs are provided
   */
  ERROR_LEVEL_DETAILED,

  /** 
   * The Environment variable reviewed for TraceLevel
   * (to use for default, if it is not provided on initialization)
   */
  ENV_CLI_TRACE_LEVEL

} from './DeveloperError.ts';

import type { OrgDetailResult, OrgDetail, OrgListCommandResults, OrgListResultObj, AliasObj } from './types/CliTypes.ts';

/**
 * Strips anything prior to the output
 * @param {string} output - the output from the cli
 * @return {string}
 */
export function cleanCliOutput(str:string):string {
  return (str || '').substring(str.indexOf('{'));
}

/**
 * Options accepted and sent to JSForce
 */
export interface Options {
  /** The TraceLevel to use for the connection */
  traceLevel:number;
}

interface EnvObj extends Object {
  hasOwn(prop:string):boolean;
  ENV_CLI_TRACE_LEVEL:string;
}

/**
 * Implementation of the Salesforce Cli Connector
 * with more broken down access, and a more busy interface
 * to better allow for testing.
 */
export class SalesforceCliConnectorImpl {
  /**
   * the level that we will be tracing the output
   * (by default - 0 or ERROR_LEVEL_BASIC / no trace information)
   * @see ERROR_LEVEL_BASIC
   * @see ERROR_LEVEL_DETAILED
   * @see ERROR_LEVEL_NONE
   */
  traceLevel = ERROR_LEVEL_BASIC;

  /**
   * Constructor
   */
  constructor() {
    this.setOptions();
  }

  /**
   * Flags to send to the connector
   * @param {Options} options - the options to use for the JSForce Connection
   * @returns {Options} - the options used (with defaults applied)
   */
  async setOptions(options?:Options):Promise<Options> {
    const defaults = {
      traceLevel: ERROR_LEVEL_BASIC
    };

    const env = await load() as unknown as EnvObj;
    if (env.hasOwnProperty(ENV_CLI_TRACE_LEVEL)) {
      const envTraceLevel = Number.parseInt(env.ENV_CLI_TRACE_LEVEL);
      if (Number.isSafeInteger(envTraceLevel)) {
        defaults.traceLevel = envTraceLevel;
      }
    }

    const cleanOptions = Object.assign(defaults, options) as Options;

    this.traceLevel = cleanOptions.traceLevel;

    return cleanOptions;
  }

  /**
   * Main Function - Gets a JSForce Connection to an org based on an alias
   * 
   * This is likely the function you want
   * 
   * @param {string} alias? - the alias to use - or the CLI Config Default Org if undefined is sent
   * @return {Connection} - connection
   * @example
   * import connector from 'jsr:@darkbluestudios/salesforce-cli-repl';
   * 
   * const connection = await connector.getConnection('my_org_alias');
   * 
   * const accountDescribe = await connection.describeSObject('Account');
   * 
   * const accountFields = accountDescribe.fields.map((o => o.Name));
   */
  async getConnection(alias?:string): Promise<Connection | null> {
    try {
      const connectionInfo:OrgDetailResult = await this.getConnectionDetail(alias);

      const result = new jsForce.default.Connection({
        serverUrl: connectionInfo.instanceUrl,
        sessionId: connectionInfo.accessToken
      });
      result.version = connectionInfo.apiVersion;

      return result;
    } catch (err) {
      let cleanedError;
      if (err instanceof DeveloperError) {
        /*
        DeveloperError.info(
          this.traceLevel,
          'Error caught intentionally by the salesforce-cli-library',
          ERROR_LEVEL_DETAILED
        );
        */
        cleanedError = err as DeveloperError;
        cleanedError.log(this.traceLevel);
      } else {
        console.error(`Error not caught by the salesforce-cli-library,
likely because of changes in the CLI or jsforce libraries.

Please submit an issue on the jsr repository`);
        throw err;
      }
      return null;
    }
  }

  /**
   * Gets the connection details for an org using the salesforce cli alias
   * @param {string} alias? - the alias to use - or the CLI Config Default Org if undefined
   * @return {Connection}
   */
  getConnectionDetail(alias?:string):Promise<OrgDetailResult> {
    const connObj:OrgDetail = this.getOrgDetail(alias);

    DeveloperError.info(
      this.traceLevel,
      `Response from the CLI did not give an error and was valid JSON

Now validating the format of the object.
      
${JSON.stringify(connObj)}`,
      ERROR_LEVEL_DETAILED
    );

    if (connObj.status === 0) {
      DeveloperError.info(
        this.traceLevel,
        `connection status is 0, meaning success`,
        ERROR_LEVEL_DETAILED
      );
      return Promise.resolve(connObj.result);
    }

    DeveloperError.info(
      this.traceLevel,
      `connection status is ${connObj.status}, meaning failure`,
      ERROR_LEVEL_DETAILED
    );

    let message = `CLI reported an error in the message object, status: ${connObj.status}

${connObj.message}`;
    if (connObj.actions) {
      message += `\n\n${connObj.actions.join('\n')}`;
    }
    const cleanError = new DeveloperError(
      message,
      '',
      connObj.stack
    );
    throw cleanError;
  }

  /**
   * Provide the list of aliases available
   * 
   * NOTE: this intentionally does not provide additional detail for the orgs
   * to minimize information exposure
   * 
   * @returns {AliasObj[]} - list of aliases on the system
   * @example
   * connection.list();
   * // [
   * //   {
   * //     type: "other",
   * //     alias: "myDevHub",
   * //     isDefaultDevHub: true,
   * //     isDefault: false
   * //   },
   * //   {
   * //     type: "other",
   * //     alias: "utamTest",
   * //     isDefaultDevHub: false,
   * //     isDefault: true
   * //   }
   * // ]
   */
  list():AliasObj[] {
    const args = ['org', 'list', '--json'];

    DeveloperError.info(
      this.traceLevel,
      `running the command: sf ${args.join(' ')}`,
      ERROR_LEVEL_DETAILED
    );

    const command = new Deno.Command('sf', { args });

    const { code, stdout, stderr } = command.outputSync();

    const rawOutput = new TextDecoder('utf8').decode(stdout);

    const rawError = new TextDecoder('utf8').decode(stderr);

    const cleanOutput = cleanCliOutput(rawOutput);

    if (code !== 0) {
      DeveloperError.info(
        this.traceLevel,
        `CLI Command returned FAILURE status code > 0, ${code}`,
        ERROR_LEVEL_DETAILED
      );

      let errorObj;
      try {
        errorObj = JSON.parse(cleanOutput);
      } catch (_err) {
        try {
          const cleanError = cleanCliOutput(rawError);
          errorObj = JSON.parse(cleanError);
        } catch (_err) {
          //-- unable to to parse either output or error, just let it go
          new DeveloperError(
            `Error occurred while listing aliases.

CLI returned an Error Code and did not return back valid JSON

raw output from command:
${rawOutput}

raw error from command:
${rawError}`,
            `tried parsing both output and error as JSON`,
            ''
          ).log(this.traceLevel);
          return [];
        }

        const errorMessage = errorObj.message;
        new DeveloperError(
          errorMessage,
          rawOutput,
          errorObj.stack
        ).log(this.traceLevel);
        return [];
      }
    }

    let successObj;
    try {
      successObj = JSON.parse(cleanOutput);
    } catch (_err) {
      //-- unable to to much, just let it go
      new DeveloperError(
        `Error occurred while listing aliases.

Response from the CLI Command was not JSON.

${rawOutput}`,
        `unable to parse json from command.

raw output from command:\n${rawOutput}

output cleaned to only json :\n${cleanOutput}`,
        ''
      ).log(this.traceLevel);
      return []
    }

    const results:AliasObj[] = Object.entries(successObj.result)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        const aliasList:OrgListResultObj[] = value as OrgListResultObj[];
        return aliasList.map((v:OrgListResultObj) => {
          const aliasResult:AliasObj = {
            type:key,
            alias: v.alias,
            isDefaultDevHub: v.isDefaultDevHubUsername,
            isDefault: v.isDefaultUsername
          }
          return aliasResult;
        });
      } else {
        console.log('results value is not an array:', JSON.stringify(value));
        return []
      }
    });

    return results;
  }

  /**
   * Get a salesforce org detail for a given alias
   * @visibility private
   * @param {string?} alias - the alias to use from the salesforce CLI or the default org if undefined
   * @return {Connection}
   */
  getOrgDetail(alias?:string):OrgDetail {
    const args = ['org', 'display', '--json'];

    if (alias) {
      args.push('-o', alias);
    }

    DeveloperError.info(
      this.traceLevel,
      `running the command: sf ${args.join(' ')}`,
      ERROR_LEVEL_DETAILED
    );

    const command = new Deno.Command('sf', { args });

    const { code, stdout, stderr } = command.outputSync();

    const rawOutput = new TextDecoder('utf8').decode(stdout);

    const rawError = new TextDecoder('utf8').decode(stderr);

    const cleanOutput = cleanCliOutput(rawOutput);

    if (code !== 0) {
      DeveloperError.info(
        this.traceLevel,
        `CLI Command returned FAILURE status code > 0, ${code}`,
        ERROR_LEVEL_DETAILED
      );

      let errorObj;
      try {
        errorObj = JSON.parse(cleanOutput);
      } catch (_err) {
        try {
          const cleanError = cleanCliOutput(rawError);
          errorObj = JSON.parse(cleanError);
        } catch (_err) {
          //-- unable to to parse either output or error, just let it go
          throw new DeveloperError(
            `Error occurred while asking the salesforce cli for alias:${alias || 'default'}

CLI returned an error code and did not return back valid JSON

raw output from command:
${rawOutput}

raw error from command:
${rawError}`,
            `tried parsing both output and error as JSON`,
            ''
          );
        }
      }

      let errorMessage = errorObj.message;
      if (errorObj.actions) {
        errorMessage += `\n\n${errorObj.actions.join('\n')}`;
      }
      throw new DeveloperError(
        errorMessage,
        rawOutput,
        errorObj.stack
      );
    }

    let successObj;
    try {
      successObj = JSON.parse(cleanOutput);
    } catch (_err) {
      //-- unable to to much, just let it go
      throw new DeveloperError(
        `Error occurred while asking the salesforce cli for alias:${alias || 'default'}

Response from the CLI Command was not JSON

${rawOutput}`,
        `unable to parse json from command.

raw output from command:\n${rawOutput}

output cleaned to only json :\n${cleanOutput}`,
        ''
      );
    }

    const cmdResults:OrgListCommandResults = successObj as OrgListCommandResults;
    if (cmdResults.status !== 0) {
      throw new DeveloperError(
        `CLI returned FAILURE status: ${cmdResults.status}

${rawOutput}

${rawError}`,
        '',
        ''
      );
    }

    return successObj;
  }
}
