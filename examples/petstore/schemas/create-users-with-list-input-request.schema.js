/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
"use strict";module.exports = validate10;module.exports.default = validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"createUsersWithListInputRequest","type":"array","items":{"$ref":"#/$defs/User"},"$defs":{"User":{"type":"object","title":"User","properties":{"id":{"type":"integer","title":"id"},"username":{"type":"string","title":"username"},"firstName":{"type":"string","title":"firstName"},"lastName":{"type":"string","title":"lastName"},"email":{"type":"string","title":"email"},"password":{"type":"string","title":"password"},"phone":{"type":"string","title":"phone"},"userStatus":{"type":"integer","title":"userStatus","description":"User Status"}},"additionalProperties":true}}};const schema12 = {"type":"object","title":"User","properties":{"id":{"type":"integer","title":"id"},"username":{"type":"string","title":"username"},"firstName":{"type":"string","title":"firstName"},"lastName":{"type":"string","title":"lastName"},"email":{"type":"string","title":"email"},"password":{"type":"string","title":"password"},"phone":{"type":"string","title":"phone"},"userStatus":{"type":"integer","title":"userStatus","description":"User Status"}},"additionalProperties":true};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(Array.isArray(data)){var valid0 = true;const len0 = data.length;for(let i0=0; i0<len0; i0++){let data0 = data[i0];const _errs1 = errors;const _errs2 = errors;if(errors === _errs2){if(data0 && typeof data0 == "object" && !Array.isArray(data0)){if(data0.id !== undefined){let data1 = data0.id;const _errs5 = errors;if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){validate10.errors = [{instancePath:instancePath+"/" + i0+"/id",schemaPath:"#/$defs/User/properties/id/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];return false;}var valid2 = _errs5 === errors;}else {var valid2 = true;}if(valid2){if(data0.username !== undefined){const _errs7 = errors;if(typeof data0.username !== "string"){validate10.errors = [{instancePath:instancePath+"/" + i0+"/username",schemaPath:"#/$defs/User/properties/username/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid2 = _errs7 === errors;}else {var valid2 = true;}if(valid2){if(data0.firstName !== undefined){const _errs9 = errors;if(typeof data0.firstName !== "string"){validate10.errors = [{instancePath:instancePath+"/" + i0+"/firstName",schemaPath:"#/$defs/User/properties/firstName/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid2 = _errs9 === errors;}else {var valid2 = true;}if(valid2){if(data0.lastName !== undefined){const _errs11 = errors;if(typeof data0.lastName !== "string"){validate10.errors = [{instancePath:instancePath+"/" + i0+"/lastName",schemaPath:"#/$defs/User/properties/lastName/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid2 = _errs11 === errors;}else {var valid2 = true;}if(valid2){if(data0.email !== undefined){const _errs13 = errors;if(typeof data0.email !== "string"){validate10.errors = [{instancePath:instancePath+"/" + i0+"/email",schemaPath:"#/$defs/User/properties/email/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid2 = _errs13 === errors;}else {var valid2 = true;}if(valid2){if(data0.password !== undefined){const _errs15 = errors;if(typeof data0.password !== "string"){validate10.errors = [{instancePath:instancePath+"/" + i0+"/password",schemaPath:"#/$defs/User/properties/password/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid2 = _errs15 === errors;}else {var valid2 = true;}if(valid2){if(data0.phone !== undefined){const _errs17 = errors;if(typeof data0.phone !== "string"){validate10.errors = [{instancePath:instancePath+"/" + i0+"/phone",schemaPath:"#/$defs/User/properties/phone/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid2 = _errs17 === errors;}else {var valid2 = true;}if(valid2){if(data0.userStatus !== undefined){let data8 = data0.userStatus;const _errs19 = errors;if(!(((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8))) && (isFinite(data8)))){validate10.errors = [{instancePath:instancePath+"/" + i0+"/userStatus",schemaPath:"#/$defs/User/properties/userStatus/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];return false;}var valid2 = _errs19 === errors;}else {var valid2 = true;}}}}}}}}}else {validate10.errors = [{instancePath:instancePath+"/" + i0,schemaPath:"#/$defs/User/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid0 = _errs1 === errors;if(!valid0){break;}}}else {validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "array"},message:"must be array"}];return false;}}validate10.errors = vErrors;return errors === 0;};validate10.schema=schema11;