/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
const l={$schema:"http://json-schema.org/draft-07/schema#",title:"Query",type:"object",properties:{limit:{type:"number"}},required:["limit"],additionalProperties:!0};function t(e,{instancePath:s="",parentData:p,parentDataProperty:u,rootData:f=e}={}){let a=null,o=0;if(o===0)if(e&&typeof e=="object"&&!Array.isArray(e)){let m;if(e.limit===void 0&&(m="limit"))return t.errors=[{instancePath:s,schemaPath:"#/required",keyword:"required",params:{missingProperty:m},message:"must have required property '"+m+"'"}],!1;if(e.limit!==void 0){let r=e.limit;if(!(typeof r=="number"&&isFinite(r))){let n=typeof r,i;if(i===void 0)if(n=="boolean"||r===null||n=="string"&&r&&r==+r)i=+r;else return t.errors=[{instancePath:s+"/limit",schemaPath:"#/properties/limit/type",keyword:"type",params:{type:"number"},message:"must be number"}],!1;i!==void 0&&(r=i,e!==void 0&&(e.limit=i))}}}else return t.errors=[{instancePath:s,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"}],!1;return t.errors=a,o===0}t.schema=l;export{t as validate10};
