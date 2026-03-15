# Overview

Simple project to make it easy to connect to salesforce over node REPL CLI.

For example:

* Start [node repl / command line interface](https://nodejs.org/api/repl.html): `node --experimental-repl-await`

* import the module: `const connector = require('....');`

* get a connection: `let conn = await connector.getConnection('Some_Salesforce_CLI_Alias');`

* run with gas, because you now have a valid [jsForce connection](https://jsforce.github.io/document/): `const accountDescribe = await conn.describeSObject('Account');`

## What would I use this for?

Essentially anything you can do with a valid JsForce connection:

* You can get all picklist fields:

```
let allAccountPicklistFields = (await conn.describeSObject('Account'))
	.fields
	.filter((f) => f.type === "Picklist");
//
```

* You can get a clear list of all fields

```
let allFields = accountDescribe
	.map(({name, label}) => ({name, label});

```

* then when you are all set, write the results

```
// note that the `_` variable in nodejs repl is the last result
connector.writeFile('./tmp/allFields.json', _ );
// or explicitly specify the variable to write out
connector.writeFile('./tmp/allFields.json', allFields);
```

* or read them back when you're ready

```
// list files in the tmp directory
connector.listFiles('./tmp/');
// ['allFields.json', 'README.md']

// read json
const allFieldsLoaded = connector.readJSON('./tmp/allFields.json');

// read plain text file
const readme = connector.readFile('./tmp/README.md');
```

... 

Alternatively you can list all metadata types available for the org:

```
const allMetadataTypes = (await conn.metadata.describe()).metadataObjects;
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
await conn.metadata.list({ type: 'CustomObject' });
```

createdDate             |fileName                                     |fullName                      |id|lastModifiedDate        |type        
--                      |--                                           |--                            |--|--                      |--          
1970-01-01T00:00:00.000Z|objects/WorkStep.object                      |WorkStep                      |  |1970-01-01T00:00:00.000Z|CustomObject
1970-01-01T00:00:00.000Z|objects/ServiceAppointmentAttendee.object    |ServiceAppointmentAttendee    |  |1970-01-01T00:00:00.000Z|CustomObject
1970-01-01T00:00:00.000Z|objects/AssetAction.object                   |AssetAction                   |  |1970-01-01T00:00:00.000Z|CustomObject
1970-01-01T00:00:00.000Z|objects/ProductCatalog.object                |ProductCatalog                |  |1970-01-01T00:00:00.000Z|CustomObject

...
And other methods available from [JsForce](https://jsforce.github.io/document/)

# See Also

* [JsForce](https://jsforce.github.io/document/)
* [JsForce Web Console](https://jsforce.github.io/jsforce-web-console/)
* [deno nodejs compatability](https://docs.deno.com/runtime/fundamentals/node/)
