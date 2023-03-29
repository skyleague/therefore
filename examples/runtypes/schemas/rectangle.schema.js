/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
const p={$schema:"http://json-schema.org/draft-07/schema#",title:"Rectangle",type:"object",properties:{width:{type:"number"},height:{type:"number"}},required:["width","height"],additionalProperties:!0};function r(e,{instancePath:i="",parentData:m,parentDataProperty:u,rootData:y=e}={}){let n=null,t=0;if(t===0)if(e&&typeof e=="object"&&!Array.isArray(e)){let h;if(e.width===void 0&&(h="width")||e.height===void 0&&(h="height"))return r.errors=[{instancePath:i,schemaPath:"#/required",keyword:"required",params:{missingProperty:h},message:"must have required property '"+h+"'"}],!1;if(e.width!==void 0){let s=e.width;const o=t;if(!(typeof s=="number"&&isFinite(s)))return r.errors=[{instancePath:i+"/width",schemaPath:"#/properties/width/type",keyword:"type",params:{type:"number"},message:"must be number"}],!1;var a=o===t}else var a=!0;if(a)if(e.height!==void 0){let s=e.height;const o=t;if(!(typeof s=="number"&&isFinite(s)))return r.errors=[{instancePath:i+"/height",schemaPath:"#/properties/height/type",keyword:"type",params:{type:"number"},message:"must be number"}],!1;var a=o===t}else var a=!0}else return r.errors=[{instancePath:i,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"}],!1;return r.errors=n,t===0}r.schema=p;export{r as validate10};
