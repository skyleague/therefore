/* eslint-disable */
// @ts-nocheck
/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code
 */
"use strict";
/** @type {unknown} */
export const validate = validate10;export default validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"Person","type":"object","properties":{"name":{"type":"string"},"age":{"type":"number"},"nested":{"type":"object","properties":{"pet":{"type":"string"}},"required":["pet"],"additionalProperties":true}},"required":["age","name","nested"],"additionalProperties":true};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if((((data.age === undefined) && (missing0 = "age")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.nested === undefined) && (missing0 = "nested"))){validate10.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];return false;}else {if(data.name !== undefined){const _errs2 = errors;if(typeof data.name !== "string"){validate10.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid0 = _errs2 === errors;}else {var valid0 = true;}if(valid0){if(data.age !== undefined){let data1 = data.age;const _errs4 = errors;if(!((typeof data1 == "number") && (isFinite(data1)))){validate10.errors = [{instancePath:instancePath+"/age",schemaPath:"#/properties/age/type",keyword:"type",params:{type: "number"},message:"must be number"}];return false;}var valid0 = _errs4 === errors;}else {var valid0 = true;}if(valid0){if(data.nested !== undefined){let data2 = data.nested;const _errs6 = errors;if(errors === _errs6){if(data2 && typeof data2 == "object" && !Array.isArray(data2)){let missing1;if((data2.pet === undefined) && (missing1 = "pet")){validate10.errors = [{instancePath:instancePath+"/nested",schemaPath:"#/properties/nested/required",keyword:"required",params:{missingProperty: missing1},message:"must have required property '"+missing1+"'"}];return false;}else {if(data2.pet !== undefined){if(typeof data2.pet !== "string"){validate10.errors = [{instancePath:instancePath+"/nested/pet",schemaPath:"#/properties/nested/properties/pet/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}}}}else {validate10.errors = [{instancePath:instancePath+"/nested",schemaPath:"#/properties/nested/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid0 = _errs6 === errors;}else {var valid0 = true;}}}}}else {validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate10.errors = vErrors;return errors === 0;};validate.schema=schema11;