/* eslint-disable */
// @ts-nocheck
/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code
 */
"use strict";
/** @type {unknown} */
export const validate = validate10;export default validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"CreateConnectTokenResponse","type":"object","properties":{"access_token":{"type":"string"},"expires_in":{"type":"number"},"scope":{"type":"string"},"token_type":{"const":"Bearer"}},"required":["access_token","expires_in"],"additionalProperties":true};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if(((data.access_token === undefined) && (missing0 = "access_token")) || ((data.expires_in === undefined) && (missing0 = "expires_in"))){validate10.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];return false;}else {if(data.access_token !== undefined){const _errs2 = errors;if(typeof data.access_token !== "string"){validate10.errors = [{instancePath:instancePath+"/access_token",schemaPath:"#/properties/access_token/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid0 = _errs2 === errors;}else {var valid0 = true;}if(valid0){if(data.expires_in !== undefined){let data1 = data.expires_in;const _errs4 = errors;if(!((typeof data1 == "number") && (isFinite(data1)))){validate10.errors = [{instancePath:instancePath+"/expires_in",schemaPath:"#/properties/expires_in/type",keyword:"type",params:{type: "number"},message:"must be number"}];return false;}var valid0 = _errs4 === errors;}else {var valid0 = true;}if(valid0){if(data.scope !== undefined){const _errs6 = errors;if(typeof data.scope !== "string"){validate10.errors = [{instancePath:instancePath+"/scope",schemaPath:"#/properties/scope/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid0 = _errs6 === errors;}else {var valid0 = true;}if(valid0){if(data.token_type !== undefined){const _errs8 = errors;if("Bearer" !== data.token_type){validate10.errors = [{instancePath:instancePath+"/token_type",schemaPath:"#/properties/token_type/const",keyword:"const",params:{allowedValue: "Bearer"},message:"must be equal to constant"}];return false;}var valid0 = _errs8 === errors;}else {var valid0 = true;}}}}}}else {validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate10.errors = vErrors;return errors === 0;};validate.schema=schema11;