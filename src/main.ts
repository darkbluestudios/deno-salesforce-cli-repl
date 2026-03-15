import type { Connection } from 'jsforce';

import DeveloperError from './DeveloperError.ts';
import {
  /**
   * Error Level NONE - meaning no debugs are provided
   */
  ERROR_LEVEL_NONE,

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
  ENV_CLI_TRACE_LEVEL,

  type CONSOLE_MOCK,

  LOGGER
} from './DeveloperError.ts';

export {
  DeveloperError,
  ERROR_LEVEL_NONE, ERROR_LEVEL_BASIC, ERROR_LEVEL_DETAILED,
  ENV_CLI_TRACE_LEVEL, type CONSOLE_MOCK, LOGGER
};

import {
  type Options, SalesforceCliConnectorImpl
} from './SalesforceCliReplImplementation.ts';
import type { AliasObj } from "./types/CliTypes.ts";

export { type Options, SalesforceCliConnectorImpl};

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
 * Note that passing undefined will use your default connection.
 * 
 * If you are unsure what aliases you have available run `connector.list()`
 * 
 * ```
 * connection.list();
 * // [
 * //   {
 * //     type: "other",
 * //     alias: "devHub2",
 * //     isDefaultDevHub: false,
 * //     isDefault: false
 * //   },
 * //   {
 * //     type: "other",
 * //     alias: "utamTest",
 * //     isDefaultDevHub: false,
 * //     isDefault: false
 * //   }
 * // ]
 * ```
 * 
 * You can then get all fields from Account, for example by running the command:
 * 
 * ```
 * const accountDescribe = await connection.describeSObject('Account');
 * const accountFields = accountDescribe.fields;
 * ```
 * 
 * @see {@link SalesforceCliConnector}
 * And other methods available from [JsForce](https://jsforce.github.io/document/)
 * 
 * @module main
**/



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
 * Note that passing undefined will use your default connection.
 * 
 * If you are unsure what aliases you have available run `connector.list()`
 * 
 * ```
 * connection.list();
 * // [
 * //   {
 * //     type: "other",
 * //     alias: "devHub2",
 * //     isDefaultDevHub: false,
 * //     isDefault: false
 * //   },
 * //   {
 * //     type: "other",
 * //     alias: "utamTest",
 * //     isDefaultDevHub: false,
 * //     isDefault: false
 * //   }
 * // ]
 * ```
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
  implementation:SalesforceCliConnectorImpl;

  /**
   * Constructor
   */
  constructor() {
    this.implementation = new SalesforceCliConnectorImpl();
    this.setOptions();
  }

  /**
   * Flags to send to the connector, such as the tracing level
   * 
   * For example:
   * 
   * ```
   * import connector from 'jsr:@darkbluestudios/salesforce-cli-repl';
   * import {ERROR_LEVEL_NONE, ERROR_LEVEL_BASIC, ERROR_LEVEL_DETAILED} from 'jsr:@darkbluestudios/salesforce-cli-repl';
   * 
   * console.log({ ERROR_LEVEL_NONE, ERROR_LEVEL_BASIC, ERROR_LEVEL_DETAILED });
   * // {ERROR_LEVEL_NONE: -1,    -- use this to disable any debug logging
   * //  ERROR_LEVEL_BASIC: 0,    -- use this for standard logging for errors
   * //  ERROR_LEVEL_DETAILED: 1} -- use this for enhanced logging
   * 
   * connector.setOptions({ traceLevel: ERROR_LEVEL_DETAILED });
   * 
   * const connection = connector.getConnection('MY_ORG_ALIAS');
   * //-- additional notes are provided if the connection wasn't able to work
   * ```
   * 
   * (NOTE: the tracing level can also be set through a .env,
   * and with the environment variable `ENV_CLI_TRACE_LEVEL`)
   * 
   * the level that we will be tracing the output
   * (by default - 0 or ERROR_LEVEL_BASIC / no trace information)
   * @see ERROR_LEVEL_BASIC
   * @see ERROR_LEVEL_DETAILED
   * @see ERROR_LEVEL_NONE
   * 
   * @param {Options} options - the options to use for the JSForce Connection
   * @returns {Options} - the options used (with defaults applied)
   * 
   * @example
   * 
   */
  setOptions(options?:Options):Promise<Options> {
    return this.implementation.setOptions(options);
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
  getConnection(alias?:string): Promise<Connection | null> {
    return this.implementation.getConnection(alias);
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
    return this.implementation.list();
  }
}

const CONNECTOR:SalesforceCliConnector = new SalesforceCliConnector();
export default CONNECTOR;

