/**
 * Generated by @skyleague/therefore
 * eslint-disable
 */
"use strict";module.exports = validate10;module.exports.default = validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"Json","anyOf":[{"type":"string"},{"type":"null"},{"type":"boolean"},{"type":"number"},{"type":"object","additionalProperties":{"$ref":"#"}},{"type":"array","items":{"$ref":"#"}}]};const wrapper0 = {validate: validate10};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;const _errs0 = errors;let valid0 = false;const _errs1 = errors;if(typeof data !== "string"){const err0 = {instancePath,schemaPath:"#/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};if(vErrors === null){vErrors = [err0];}else {vErrors.push(err0);}errors++;}var _valid0 = _errs1 === errors;valid0 = valid0 || _valid0;if(!valid0){const _errs3 = errors;if(data !== null){const err1 = {instancePath,schemaPath:"#/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};if(vErrors === null){vErrors = [err1];}else {vErrors.push(err1);}errors++;}var _valid0 = _errs3 === errors;valid0 = valid0 || _valid0;if(!valid0){const _errs5 = errors;if(typeof data !== "boolean"){const err2 = {instancePath,schemaPath:"#/anyOf/2/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};if(vErrors === null){vErrors = [err2];}else {vErrors.push(err2);}errors++;}var _valid0 = _errs5 === errors;valid0 = valid0 || _valid0;if(!valid0){const _errs7 = errors;if(!((typeof data == "number") && (isFinite(data)))){const err3 = {instancePath,schemaPath:"#/anyOf/3/type",keyword:"type",params:{type: "number"},message:"must be number"};if(vErrors === null){vErrors = [err3];}else {vErrors.push(err3);}errors++;}var _valid0 = _errs7 === errors;valid0 = valid0 || _valid0;if(!valid0){const _errs9 = errors;if(errors === _errs9){if(data && typeof data == "object" && !Array.isArray(data)){for(const key0 in data){const _errs12 = errors;if(!(wrapper0.validate(data[key0], {instancePath:instancePath+"/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data,parentDataProperty:key0,rootData}))){vErrors = vErrors === null ? wrapper0.validate.errors : vErrors.concat(wrapper0.validate.errors);errors = vErrors.length;}var valid1 = _errs12 === errors;if(!valid1){break;}}}else {const err4 = {instancePath,schemaPath:"#/anyOf/4/type",keyword:"type",params:{type: "object"},message:"must be object"};if(vErrors === null){vErrors = [err4];}else {vErrors.push(err4);}errors++;}}var _valid0 = _errs9 === errors;valid0 = valid0 || _valid0;if(!valid0){const _errs13 = errors;if(errors === _errs13){if(Array.isArray(data)){var valid2 = true;const len0 = data.length;for(let i0=0; i0<len0; i0++){const _errs15 = errors;if(!(wrapper0.validate(data[i0], {instancePath:instancePath+"/" + i0,parentData:data,parentDataProperty:i0,rootData}))){vErrors = vErrors === null ? wrapper0.validate.errors : vErrors.concat(wrapper0.validate.errors);errors = vErrors.length;}var valid2 = _errs15 === errors;if(!valid2){break;}}}else {const err5 = {instancePath,schemaPath:"#/anyOf/5/type",keyword:"type",params:{type: "array"},message:"must be array"};if(vErrors === null){vErrors = [err5];}else {vErrors.push(err5);}errors++;}}var _valid0 = _errs13 === errors;valid0 = valid0 || _valid0;}}}}}if(!valid0){const err6 = {instancePath,schemaPath:"#/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};if(vErrors === null){vErrors = [err6];}else {vErrors.push(err6);}errors++;validate10.errors = vErrors;return false;}else {errors = _errs0;if(vErrors !== null){if(_errs0){vErrors.length = _errs0;}else {vErrors = null;}}}validate10.errors = vErrors;return errors === 0;};validate10.schema=schema11;