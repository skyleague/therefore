/* eslint-disable */
// @ts-nocheck
/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code
 */
import { default as ajvDistRuntimeUcs2LengthDefault } from 'ajv/dist/runtime/ucs2length.js';
"use strict";
/** @type {unknown} */
export const validate = validate10;export default validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"ValidatedUser","type":"object","properties":{"id":{"type":"number"},"username":{"type":"string","minLength":3},"email":{"$ref":"#/$defs/Email"},"attributes":{"$ref":"#/$defs/Attributes"}},"required":["attributes","email","id","username"],"additionalProperties":true,"$defs":{"Email":{"type":"string","format":"email"},"Attributes":{"type":"object","additionalProperties":{"type":"string"}}}};const schema12 = {"type":"string","format":"email"};const schema13 = {"type":"object","additionalProperties":{"type":"string"}};const func4 = (ajvDistRuntimeUcs2LengthDefault.default ?? ajvDistRuntimeUcs2LengthDefault);const formats0 = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if(((((data.attributes === undefined) && (missing0 = "attributes")) || ((data.email === undefined) && (missing0 = "email"))) || ((data.id === undefined) && (missing0 = "id"))) || ((data.username === undefined) && (missing0 = "username"))){validate10.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];return false;}else {if(data.id !== undefined){let data0 = data.id;const _errs2 = errors;if(!((typeof data0 == "number") && (isFinite(data0)))){validate10.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "number"},message:"must be number"}];return false;}var valid0 = _errs2 === errors;}else {var valid0 = true;}if(valid0){if(data.username !== undefined){let data1 = data.username;const _errs4 = errors;if(errors === _errs4){if(typeof data1 === "string"){if(func4(data1) < 3){validate10.errors = [{instancePath:instancePath+"/username",schemaPath:"#/properties/username/minLength",keyword:"minLength",params:{limit: 3},message:"must NOT have fewer than 3 characters"}];return false;}}else {validate10.errors = [{instancePath:instancePath+"/username",schemaPath:"#/properties/username/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}}var valid0 = _errs4 === errors;}else {var valid0 = true;}if(valid0){if(data.email !== undefined){let data2 = data.email;const _errs6 = errors;const _errs7 = errors;if(errors === _errs7){if(errors === _errs7){if(typeof data2 === "string"){if(!(formats0.test(data2))){validate10.errors = [{instancePath:instancePath+"/email",schemaPath:"#/$defs/Email/format",keyword:"format",params:{format: "email"},message:"must match format \""+"email"+"\""}];return false;}}else {validate10.errors = [{instancePath:instancePath+"/email",schemaPath:"#/$defs/Email/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}}}var valid0 = _errs6 === errors;}else {var valid0 = true;}if(valid0){if(data.attributes !== undefined){let data3 = data.attributes;const _errs9 = errors;const _errs10 = errors;if(errors === _errs10){if(data3 && typeof data3 == "object" && !Array.isArray(data3)){for(const key0 in data3){const _errs13 = errors;if(typeof data3[key0] !== "string"){validate10.errors = [{instancePath:instancePath+"/attributes/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/Attributes/additionalProperties/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid3 = _errs13 === errors;if(!valid3){break;}}}else {validate10.errors = [{instancePath:instancePath+"/attributes",schemaPath:"#/$defs/Attributes/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid0 = _errs9 === errors;}else {var valid0 = true;}}}}}}else {validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate10.errors = vErrors;return errors === 0;};validate.schema=schema11;