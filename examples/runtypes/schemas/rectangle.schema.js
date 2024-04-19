/* eslint-disable */
// @ts-nocheck
/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code
 */
"use strict";
/** @type {unknown} */
export const validate = validate10;export default validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"Rectangle","type":"object","properties":{"width":{"type":"number"},"height":{"type":"number"}},"required":["height","width"],"additionalProperties":true};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if(((data.height === undefined) && (missing0 = "height")) || ((data.width === undefined) && (missing0 = "width"))){validate10.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];return false;}else {if(data.width !== undefined){let data0 = data.width;const _errs2 = errors;if(!((typeof data0 == "number") && (isFinite(data0)))){validate10.errors = [{instancePath:instancePath+"/width",schemaPath:"#/properties/width/type",keyword:"type",params:{type: "number"},message:"must be number"}];return false;}var valid0 = _errs2 === errors;}else {var valid0 = true;}if(valid0){if(data.height !== undefined){let data1 = data.height;const _errs4 = errors;if(!((typeof data1 == "number") && (isFinite(data1)))){validate10.errors = [{instancePath:instancePath+"/height",schemaPath:"#/properties/height/type",keyword:"type",params:{type: "number"},message:"must be number"}];return false;}var valid0 = _errs4 === errors;}else {var valid0 = true;}}}}else {validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate10.errors = vErrors;return errors === 0;};validate.schema=schema11;