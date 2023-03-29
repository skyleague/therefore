/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
const m={$schema:"http://json-schema.org/draft-07/schema#",title:"keywordExtractionRequest",type:"object",properties:{api_key:{type:"string",title:"api_key",description:"Your API Key"},n:{type:"integer",title:"n",description:"The number of keyword combinations (n-grams) that you wish to extract.",maximum:5,minimum:1},text:{type:"string",title:"text",description:"The text that you want to analyze. It should not contain HTML tags."}},required:["api_key"],additionalProperties:!0};function t(r,{instancePath:i="",parentData:y,parentDataProperty:u,rootData:f=r}={}){let p=null,s=0;if(s===0)if(r&&typeof r=="object"&&!Array.isArray(r)){let n;if(r.api_key===void 0&&(n="api_key"))return t.errors=[{instancePath:i,schemaPath:"#/required",keyword:"required",params:{missingProperty:n},message:"must have required property '"+n+"'"}],!1;if(r.api_key!==void 0){const e=s;if(typeof r.api_key!="string")return t.errors=[{instancePath:i+"/api_key",schemaPath:"#/properties/api_key/type",keyword:"type",params:{type:"string"},message:"must be string"}],!1;var a=e===s}else var a=!0;if(a){if(r.n!==void 0){let e=r.n;const o=s;if(!(typeof e=="number"&&!(e%1)&&!isNaN(e)&&isFinite(e)))return t.errors=[{instancePath:i+"/n",schemaPath:"#/properties/n/type",keyword:"type",params:{type:"integer"},message:"must be integer"}],!1;if(s===o&&typeof e=="number"&&isFinite(e)){if(e>5||isNaN(e))return t.errors=[{instancePath:i+"/n",schemaPath:"#/properties/n/maximum",keyword:"maximum",params:{comparison:"<=",limit:5},message:"must be <= 5"}],!1;if(e<1||isNaN(e))return t.errors=[{instancePath:i+"/n",schemaPath:"#/properties/n/minimum",keyword:"minimum",params:{comparison:">=",limit:1},message:"must be >= 1"}],!1}var a=o===s}else var a=!0;if(a)if(r.text!==void 0){const e=s;if(typeof r.text!="string")return t.errors=[{instancePath:i+"/text",schemaPath:"#/properties/text/type",keyword:"type",params:{type:"string"},message:"must be string"}],!1;var a=e===s}else var a=!0}}else return t.errors=[{instancePath:i,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"}],!1;return t.errors=p,s===0}t.schema=m;export{t as validate10};
