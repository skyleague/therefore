/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
const p={$schema:"http://json-schema.org/draft-07/schema#",title:"Headers",type:"object",properties:{authorization:{type:"string"}},required:["authorization"],additionalProperties:!0};function t(e,{instancePath:o="",parentData:f,parentDataProperty:d,rootData:l=e}={}){let u=null,a=0;if(a===0)if(e&&typeof e=="object"&&!Array.isArray(e)){let s;if(e.authorization===void 0&&(s="authorization"))return t.errors=[{instancePath:o,schemaPath:"#/required",keyword:"required",params:{missingProperty:s},message:"must have required property '"+s+"'"}],!1;if(e.authorization!==void 0){let i=e.authorization;if(typeof i!="string"){let n=typeof i,r;if(r===void 0)if(n=="number"||n=="boolean")r=""+i;else if(i===null)r="";else return t.errors=[{instancePath:o+"/authorization",schemaPath:"#/properties/authorization/type",keyword:"type",params:{type:"string"},message:"must be string"}],!1;r!==void 0&&(i=r,e!==void 0&&(e.authorization=r))}}}else return t.errors=[{instancePath:o,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"}],!1;return t.errors=u,a===0}t.schema=p;export{t as validate10};
