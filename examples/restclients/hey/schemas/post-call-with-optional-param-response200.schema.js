/* eslint-disable */
// @ts-nocheck
/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code
 */
"use strict";
/** @type {unknown} */
export const validate = validate10;export default validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"PostCallWithOptionalParamResponse200","type":"number"};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(!((typeof data == "number") && (isFinite(data)))){validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "number"},message:"must be number"}];return false;}validate10.errors = vErrors;return errors === 0;};validate.schema=schema11;