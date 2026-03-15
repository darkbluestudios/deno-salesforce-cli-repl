import * as jsForce from 'jsforce';
import { load } from "@std/dotenv";

import type { Connection } from 'jsforce';

/**
 * Module that creates a JSForce connection
 * using a Salesforce CLI alias
 * 
 * # Overview
 * 
 * Simple project to make it easy to connect to salesforce over node REPL CLI.
 * 
 * For example:
 * 
 * * import the module: `const connector = require('....').default;` or with import: `import connector from 'jsr:@darkbluestudios/salesforce-cli-repl'`
 * 
 * * get a connection: `let conn = await connector.getConnection('Some_Salesforce_CLI_Alias');`
 * 
 * * run with gas, because you now have a valid [jsForce connection](https://jsforce.github.io/document/): `const accountDescribe = await connection.describeSObject('Account');`
 * 
 * ## What would I use this for?
 * 
 * For those interested in Cursor, Clause or Gemini, you now have a programmatic access to the APIs for Salesforce.
 * 
 * And as Jupyter is also supported natively, it becomes very easy to make notebooks that you can repeat for any org.
 * 
 * Things this has been helpful with:
 * 
 * * Identify the number of people within a role hierarchy, and recursively for every role within them.
 * * Create a SOQL query that only retrieves "creatable" fields (fields you can use in an insert) from a source org, and upload them to another.
 * 	* Transform parent IDs on child records, after parents have been inserted
 * * You now have programmatic access to an org with the APIs available from [JSForce](https://jsforce.github.io/document/)
 * 
 * 
 * # Pre-reqsuisites
 * 
 * [Install the Salesforce CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)
 * 
 * [Connect the CLI to Salesforce](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_web_flow.htm)
 * 
 * Identify the Salesforce Org Alias of the org to connect to, by running the command `sf org list`
 * 
 * (the alias name is used directly by the library when connecting)
 * 
 * 
 * ## Getting Started
 * 
 * ```
 * import connector from 'jsr:@darkbluestudios/salesforce-cli-repl';
 * 
 * const connection = await connector.getConnection('YOUR_SALESFORCE_ALIAS_FROM_THE_CLI");
 * ```
 * 
 * thats it. you now have a JSForce connection to your browser.
 * 
 * 	Note that passing undefined will use your default connection, or you can run the command `sf org list`to get the aliases available.
 * 
 * You can then get all fields from Account, for example by running the command:
 * 
 * ```
 * const accountDescribe = await connection.describeSObject('Account');
 * const accountFields = accountDescribe.fields;
 * ```
 * 
 * ## What else can you do?
 * 
 * Essentially anything you can do with a valid [JSForce](https://jsforce.github.io/document/) connection:
 * 
 * * You can get all picklist fields:
 * 
 * ```
 * let allAccountPicklistFields = (await connection.describeSObject('Account'))
 * 	.fields
 * 	.filter((f) => f.type === "Picklist");
 * //
 * ```
 * 
 * * You can get a clear list of all fields
 * 
 * ```
 * let allFields = accountDescribe
 * 	.map(({name, label}) => ({name, label});
 * 
 * ```
 * 
 * Alternatively you can list all metadata types available for the org:
 * 
 * ```
 * const allMetadataTypes = (await connection.metadata.describe()).metadataObjects;
 * ```
 * 
 * directoryName                      |inFolder|metaFile|suffix                          |xmlName                              |childXmlNames                                                                                                                                                     
 * --                                 |--      |--      |--                              |--                                   |--                                                                                                                                                                
 * installedPackages                  |false   |false   |installedPackage                |InstalledPackage                     |[]                                                                                                                                                                
 * labels                             |false   |false   |labels                          |CustomLabels                         |["CustomLabel"]                                                                                                                                                   
 * staticresources                    |false   |true    |resource                        |StaticResource                       |[]                                                                                                                                                                
 * certs                              |false   |true    |crt                             |Certificate                          |[]                                                                                                                                                                
 * lwc                                |false   |false   |                                |LightningComponentBundle             |[]                                                                                                                                                                
 * aura                               |false   |false   |                                |AuraDefinitionBundle                 |[]                                                                                                                                                                
 * pages                              |false   |true    |page                            |ApexPage                             |[]                                                                                                                                                                
 * 
 * ...
 * OR get the list of the objects for a metadata type
 * 
 * ```
 * await connection.metadata.list({ type: 'CustomObject' });
 * ```
 * 
 * createdDate             |fileName                                     |fullName                      |id|lastModifiedDate        |type        
 * --                      |--                                           |--                            |--|--                      |--          
 * 1970-01-01T00:00:00.000Z|objects/WorkStep.object                      |WorkStep                      |  |1970-01-01T00:00:00.000Z|CustomObject
 * 1970-01-01T00:00:00.000Z|objects/ServiceAppointmentAttendee.object    |ServiceAppointmentAttendee    |  |1970-01-01T00:00:00.000Z|CustomObject
 * 1970-01-01T00:00:00.000Z|objects/AssetAction.object                   |AssetAction                   |  |1970-01-01T00:00:00.000Z|CustomObject
 * 1970-01-01T00:00:00.000Z|objects/ProductCatalog.object                |ProductCatalog                |  |1970-01-01T00:00:00.000Z|CustomObject
 * 
 * ...
 * And other methods available from [JsForce](https://jsforce.github.io/document/)
 * 
 * @module main
**/

/**
 * Error Level NONE - meaning no debugs are provided
 */
export const ERROR_LEVEL_NONE = -1;

/**
 * Error Level Basic - meaning only high level debugs are shared
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

/**
 * A result from Org Detail
 */
export interface OrgDetailResult {
  /** Username of the Org Detail */
  username:string;

  /** Org Id */
  id:string;

  /** Status of the connection */
  connectionStatus:string;

  /** Access Token */
  accessToken:string;

  /** URL for the instance */
  instanceUrl:string;

  /** client id */
  clientId:string;

  /** name of the alias */
  alias:string;

  /** api version of the connection */
  apiVersion:string;
}

/**
 * Raw response from Org Detail
 */
export interface OrgDetail {
  /** Status of the org */
  status:number;

  /** Error message provided */
  message:string;

  /** the stack of the problem */
  stack:string;

  /** result of the connection */
  result:OrgDetailResult;

  /** actions sugggested by the cli */
  actions:string[];
}

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
export class DeveloperError extends Error {
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
 * Simple class that returns a JSForceconnection
 * based from a Salesforce CLI Alias
 * 
 * # Overview
 * 
 * Simple project to make it easy to connect to salesforce over node REPL CLI.
 * 
 * For example:
 * 
 * * import the module: `const connector = require('....').default;` or with import: `import connector from 'jsr:@darkbluestudios/salesforce-cli-repl'`
 * 
 * * get a connection: `let conn = await connector.getConnection('Some_Salesforce_CLI_Alias');`
 * 
 * * run with gas, because you now have a valid [jsForce connection](https://jsforce.github.io/document/): `const accountDescribe = await connection.describeSObject('Account');`
 * 
 * ## What would I use this for?
 * 
 * For those interested in Cursor, Clause or Gemini, you now have a programmatic access to the APIs for Salesforce.
 * 
 * And as Jupyter is also supported natively, it becomes very easy to make notebooks that you can repeat for any org.
 * 
 * Things this has been helpful with:
 * 
 * * Identify the number of people within a role hierarchy, and recursively for every role within them.
 * * Create a SOQL query that only retrieves "creatable" fields (fields you can use in an insert) from a source org, and upload them to another.
 * 	* Transform parent IDs on child records, after parents have been inserted
 * * You now have programmatic access to an org with the APIs available from [JSForce](https://jsforce.github.io/document/)
 * 
 * 
 * # Pre-reqsuisites
 * 
 * [Install the Salesforce CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)
 * 
 * [Connect the CLI to Salesforce](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_web_flow.htm)
 * 
 * Identify the Salesforce Org Alias of the org to connect to, by running the command `sf org list`
 * 
 * (the alias name is used directly by the library when connecting)
 * 
 * 
 * ## Getting Started
 * 
 * ```
 * import connector from 'jsr:@darkbluestudios/salesforce-cli-repl';
 * 
 * const connection = await connector.getConnection('YOUR_SALESFORCE_ALIAS_FROM_THE_CLI");
 * ```
 * 
 * thats it. you now have a JSForce connection to your browser.
 * 
 * 	Note that passing undefined will use your default connection, or you can run the command `sf org list`to get the aliases available.
 * 
 * You can then get all fields from Account, for example by running the command:
 * 
 * ```
 * const accountDescribe = await connection.describeSObject('Account');
 * const accountFields = accountDescribe.fields;
 * ```
 * 
 * ## What else can you do?
 * 
 * Essentially anything you can do with a valid [JSForce](https://jsforce.github.io/document/) connection:
 * 
 * * You can get all picklist fields:
 * 
 * ```
 * let allAccountPicklistFields = (await connection.describeSObject('Account'))
 * 	.fields
 * 	.filter((f) => f.type === "Picklist");
 * //
 * ```
 * 
 * * You can get a clear list of all fields
 * 
 * ```
 * let allFields = accountDescribe
 * 	.map(({name, label}) => ({name, label});
 * 
 * ```
 * 
 * Alternatively you can list all metadata types available for the org:
 * 
 * ```
 * const allMetadataTypes = (await connection.metadata.describe()).metadataObjects;
 * ```
 * 
 * directoryName                      |inFolder|metaFile|suffix                          |xmlName                              |childXmlNames                                                                                                                                                     
 * --                                 |--      |--      |--                              |--                                   |--                                                                                                                                                                
 * installedPackages                  |false   |false   |installedPackage                |InstalledPackage                     |[]                                                                                                                                                                
 * labels                             |false   |false   |labels                          |CustomLabels                         |["CustomLabel"]                                                                                                                                                   
 * staticresources                    |false   |true    |resource                        |StaticResource                       |[]                                                                                                                                                                
 * certs                              |false   |true    |crt                             |Certificate                          |[]                                                                                                                                                                
 * lwc                                |false   |false   |                                |LightningComponentBundle             |[]                                                                                                                                                                
 * aura                               |false   |false   |                                |AuraDefinitionBundle                 |[]                                                                                                                                                                
 * pages                              |false   |true    |page                            |ApexPage                             |[]                                                                                                                                                                
 * 
 * ...
 * OR get the list of the objects for a metadata type
 * 
 * ```
 * await connection.metadata.list({ type: 'CustomObject' });
 * ```
 * 
 * createdDate             |fileName                                     |fullName                      |id|lastModifiedDate        |type        
 * --                      |--                                           |--                            |--|--                      |--          
 * 1970-01-01T00:00:00.000Z|objects/WorkStep.object                      |WorkStep                      |  |1970-01-01T00:00:00.000Z|CustomObject
 * 1970-01-01T00:00:00.000Z|objects/ServiceAppointmentAttendee.object    |ServiceAppointmentAttendee    |  |1970-01-01T00:00:00.000Z|CustomObject
 * 1970-01-01T00:00:00.000Z|objects/AssetAction.object                   |AssetAction                   |  |1970-01-01T00:00:00.000Z|CustomObject
 * 1970-01-01T00:00:00.000Z|objects/ProductCatalog.object                |ProductCatalog                |  |1970-01-01T00:00:00.000Z|CustomObject
 * 
 * ...
 * And other methods available from [JsForce](https://jsforce.github.io/document/)
 */
export class SalesforceCliConnector {

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
        `CLI Command returned status code > 0, ${code}`,
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

CLI did not return back valid JSON

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
      const err = new DeveloperError(
        errorMessage,
        rawOutput,
        errorObj.stack
      );

      throw err;
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

    return successObj;
  }
}

const CONNECTOR:SalesforceCliConnector = new SalesforceCliConnector();
export default CONNECTOR;

