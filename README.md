# Overview

Simple project to make it easy to connect to salesforce over node REPL CLI.

For example:

* import the module: `const connector = require('....').default;` or with import: `import connector from 'jsr:@darkbluestudios/salesforce-cli-repl'`

* get a connection: `let conn = await connector.getConnection('Some_Salesforce_CLI_Alias');`

* run with gas, because you now have a valid [jsForce connection](https://jsforce.github.io/document/): `const accountDescribe = await connection.describeSObject('Account');`

## What would I use this for?

For those interested in Cursor, Clause or Gemini, you now have a programmatic access to the APIs for Salesforce.

And as Jupyter is also supported natively, it becomes very easy to make notebooks that you can repeat for any org.

Things this has been helpful with:

* Identify the number of people within a role hierarchy, and recursively for every role within them.
* Create a SOQL query that only retrieves "creatable" fields (fields you can use in an insert) from a source org, and upload them to another.
	* Transform parent IDs on child records, after parents have been inserted
* You now have programmatic access to an org with the APIs available from [JSForce](https://jsforce.github.io/document/)


# Pre-reqsuisites

[Install the Salesforce CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)

[Connect the CLI to Salesforce](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth_web_flow.htm)

Identify the Salesforce Org Alias of the org to connect to, by running the command `sf org list`

(the alias name is used directly by the library when connecting)


## Getting Started

```
import connector from 'jsr:@darkbluestudios/salesforce-cli-repl';

const connection = await connector.getConnection('YOUR_SALESFORCE_ALIAS_FROM_THE_CLI");
```

thats it. you now have a JSForce connection to your browser.

	Note that passing undefined will use your default connection, or you can run the command `sf org list`to get the aliases available.

You can then get all fields from Account, for example by running the command:

```
const accountDescribe = await connection.describeSObject('Account');
const accountFields = accountDescribe.fields;
```

## What else can you do?

Essentially anything you can do with a valid [JSForce](https://jsforce.github.io/document/) connection:

* You can get all picklist fields:

```
let allAccountPicklistFields = (await connection.describeSObject('Account'))
	.fields
	.filter((f) => f.type === "Picklist");
//
```

* You can get a clear list of all fields

```
let allFields = accountDescribe
	.map(({name, label}) => ({name, label});

```

Alternatively you can list all metadata types available for the org:

```
const allMetadataTypes = (await connection.metadata.describe()).metadataObjects;
```

directoryName                      |inFolder|metaFile|suffix                          |xmlName                              |childXmlNames                                                                                                                                                     
--                                 |--      |--      |--                              |--                                   |--                                                                                                                                                                
installedPackages                  |false   |false   |installedPackage                |InstalledPackage                     |[]                                                                                                                                                                
labels                             |false   |false   |labels                          |CustomLabels                         |["CustomLabel"]                                                                                                                                                   
staticresources                    |false   |true    |resource                        |StaticResource                       |[]                                                                                                                                                                
certs                              |false   |true    |crt                             |Certificate                          |[]                                                                                                                                                                
lwc                                |false   |false   |                                |LightningComponentBundle             |[]                                                                                                                                                                
aura                               |false   |false   |                                |AuraDefinitionBundle                 |[]                                                                                                                                                                
pages                              |false   |true    |page                            |ApexPage                             |[]                                                                                                                                                                

...
OR get the list of the objects for a metadata type

```
await connection.metadata.list({ type: 'CustomObject' });
```

createdDate             |fileName                                     |fullName                      |id|lastModifiedDate        |type        
--                      |--                                           |--                            |--|--                      |--          
1970-01-01T00:00:00.000Z|objects/WorkStep.object                      |WorkStep                      |  |1970-01-01T00:00:00.000Z|CustomObject
1970-01-01T00:00:00.000Z|objects/ServiceAppointmentAttendee.object    |ServiceAppointmentAttendee    |  |1970-01-01T00:00:00.000Z|CustomObject
1970-01-01T00:00:00.000Z|objects/AssetAction.object                   |AssetAction                   |  |1970-01-01T00:00:00.000Z|CustomObject
1970-01-01T00:00:00.000Z|objects/ProductCatalog.object                |ProductCatalog                |  |1970-01-01T00:00:00.000Z|CustomObject

...
And other methods available from [JsForce](https://jsforce.github.io/document/)

# NodeJS Await

Note that await is still not available out of the box.

(although it IS available out of the box for Bun and Deno)

If running within NodeJS, (Start [node repl / command line interface](https://nodejs.org/api/repl.html): `node --experimental-repl-await`

# See Also

* [JsForce](https://jsforce.github.io/document/)
* [JsForce Web Console](https://jsforce.github.io/jsforce-web-console/)
* [deno nodejs compatability](https://docs.deno.com/runtime/fundamentals/node/)
