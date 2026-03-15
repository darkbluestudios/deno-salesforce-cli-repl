

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

export interface OrgListResultObj {
  alias:string;
  isDefaultUsername:boolean;
  isDefaultDevHubUsername:boolean;
}

export interface OrgListResult extends Object {
  other: OrgListResultObj[],
  sandboxes: OrgListResultObj[],
  nonScratchOrgs: OrgListResultObj[],
  devHubs: OrgListResultObj[],
  scratchOrgs: OrgListResultObj[]
}

export interface OrgListCommandResults extends Object {
  status:number;
  result: OrgListResult
}

export interface AliasObj {
  /** name of the alias */
  alias:string;

  /** type of the alias */
  type:string;

  /** whether it is a dev hub */
  isDefaultDevHub:boolean;

  /** whether it is a default org */
  isDefault:boolean;
}
