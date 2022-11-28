/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
"use strict";module.exports = validate10;module.exports.default = validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"documentSimilarityRequest","type":"object","properties":{"api_key":{"type":"string","title":"api_key","description":"Your API Key"},"copy":{"type":"string","title":"copy","description":"The second text. It should not contain HTML tags."},"original":{"type":"string","title":"original","description":"The first text. It should not contain HTML tags."}},"required":["api_key"],"additionalProperties":true};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if((data.api_key === undefined) && (missing0 = "api_key")){validate10.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];return false;}else {if(data.api_key !== undefined){const _errs2 = errors;if(typeof data.api_key !== "string"){validate10.errors = [{instancePath:instancePath+"/api_key",schemaPath:"#/properties/api_key/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid0 = _errs2 === errors;}else {var valid0 = true;}if(valid0){if(data.copy !== undefined){const _errs4 = errors;if(typeof data.copy !== "string"){validate10.errors = [{instancePath:instancePath+"/copy",schemaPath:"#/properties/copy/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid0 = _errs4 === errors;}else {var valid0 = true;}if(valid0){if(data.original !== undefined){const _errs6 = errors;if(typeof data.original !== "string"){validate10.errors = [{instancePath:instancePath+"/original",schemaPath:"#/properties/original/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid0 = _errs6 === errors;}else {var valid0 = true;}}}}}else {validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate10.errors = vErrors;return errors === 0;};validate10.schema=schema11;