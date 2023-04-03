/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
const schema11={"$schema":"http://json-schema.org/draft-07/schema#","title":"ApiResponse","type":"object","properties":{"code":{"type":"integer","title":"code"},"type":{"type":"string","title":"type"},"message":{"type":"string","title":"message"}},"additionalProperties":true};function validate10(data,{instancePath="",parentData,parentDataProperty,rootData=data}={}){let vErrors=null;let errors=0;if(errors===0){if(data&&typeof data=="object"&&!Array.isArray(data)){if(data.code!==void 0){let data0=data.code;const _errs2=errors;if(!(typeof data0=="number"&&(!(data0%1)&&!isNaN(data0))&&isFinite(data0))){validate10.errors=[{instancePath:instancePath+"/code",schemaPath:"#/properties/code/type",keyword:"type",params:{type:"integer"},message:"must be integer"}];return false}var valid0=_errs2===errors}else{var valid0=true}if(valid0){if(data.type!==void 0){const _errs4=errors;if(typeof data.type!=="string"){validate10.errors=[{instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid0=_errs4===errors}else{var valid0=true}if(valid0){if(data.message!==void 0){const _errs6=errors;if(typeof data.message!=="string"){validate10.errors=[{instancePath:instancePath+"/message",schemaPath:"#/properties/message/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid0=_errs6===errors}else{var valid0=true}}}}else{validate10.errors=[{instancePath,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"}];return false}}validate10.errors=vErrors;return errors===0};validate10.schema=schema11;export{validate10};
