/* eslint-disable */
// @ts-nocheck
/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code
 */
"use strict";
/** @type {unknown} */
export const validate = validate10;export default validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"PostCallWithOptionalParamRequest","type":"object","properties":{"offset":{"type":["number","null"]}},"additionalProperties":true};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){if(data.offset !== undefined){let data0 = data.offset;if((!((typeof data0 == "number") && (isFinite(data0)))) && (data0 !== null)){validate10.errors = [{instancePath:instancePath+"/offset",schemaPath:"#/properties/offset/type",keyword:"type",params:{type: schema11.properties.offset.type},message:"must be number,null"}];return false;}}}else {validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate10.errors = vErrors;return errors === 0;};validate.schema=schema11;