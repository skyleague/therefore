/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
const validate=validate10;var stdin_default=validate10;const schema11={"$schema":"http://json-schema.org/draft-07/schema#","title":"loginUserResponse","type":"string"};function validate10(data,{instancePath="",parentData,parentDataProperty,rootData=data}={}){let vErrors=null;let errors=0;if(typeof data!=="string"){validate10.errors=[{instancePath,schemaPath:"#/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}validate10.errors=vErrors;return errors===0};validate.schema=schema11;export{stdin_default as default,validate};
