/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
const schema11={"$schema":"http://json-schema.org/draft-07/schema#","title":"getApodResponse","type":"array","items":{}};function validate10(data,{instancePath="",parentData,parentDataProperty,rootData=data}={}){let vErrors=null;let errors=0;if(errors===0){if(!Array.isArray(data)){validate10.errors=[{instancePath,schemaPath:"#/type",keyword:"type",params:{type:"array"},message:"must be array"}];return false}}validate10.errors=vErrors;return errors===0};validate10.schema=schema11;export{validate10};
