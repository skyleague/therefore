/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
const o={$schema:"http://json-schema.org/draft-07/schema#",title:"Order",type:"object",properties:{id:{type:"integer",title:"id"},petId:{type:"integer",title:"petId"},quantity:{type:"integer",title:"quantity"},shipDate:{type:"string",title:"shipDate",format:"date-time"},status:{title:"status",description:"Order Status",enum:["placed","approved","delivered"]},complete:{type:"boolean",title:"complete"}},additionalProperties:!0};function i(t,{instancePath:a="",parentData:l,parentDataProperty:u,rootData:m=t}={}){let n=null,r=0;if(r===0)if(t&&typeof t=="object"&&!Array.isArray(t)){if(t.id!==void 0){let e=t.id;const p=r;if(!(typeof e=="number"&&!(e%1)&&!isNaN(e)&&isFinite(e)))return i.errors=[{instancePath:a+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type:"integer"},message:"must be integer"}],!1;var s=p===r}else var s=!0;if(s){if(t.petId!==void 0){let e=t.petId;const p=r;if(!(typeof e=="number"&&!(e%1)&&!isNaN(e)&&isFinite(e)))return i.errors=[{instancePath:a+"/petId",schemaPath:"#/properties/petId/type",keyword:"type",params:{type:"integer"},message:"must be integer"}],!1;var s=p===r}else var s=!0;if(s){if(t.quantity!==void 0){let e=t.quantity;const p=r;if(!(typeof e=="number"&&!(e%1)&&!isNaN(e)&&isFinite(e)))return i.errors=[{instancePath:a+"/quantity",schemaPath:"#/properties/quantity/type",keyword:"type",params:{type:"integer"},message:"must be integer"}],!1;var s=p===r}else var s=!0;if(s){if(t.shipDate!==void 0){const e=r;if(r===e&&r===e&&typeof t.shipDate!="string")return i.errors=[{instancePath:a+"/shipDate",schemaPath:"#/properties/shipDate/type",keyword:"type",params:{type:"string"},message:"must be string"}],!1;var s=e===r}else var s=!0;if(s){if(t.status!==void 0){let e=t.status;const p=r;if(!(e==="placed"||e==="approved"||e==="delivered"))return i.errors=[{instancePath:a+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues:o.properties.status.enum},message:"must be equal to one of the allowed values"}],!1;var s=p===r}else var s=!0;if(s)if(t.complete!==void 0){const e=r;if(typeof t.complete!="boolean")return i.errors=[{instancePath:a+"/complete",schemaPath:"#/properties/complete/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"}],!1;var s=e===r}else var s=!0}}}}}else return i.errors=[{instancePath:a,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"}],!1;return i.errors=n,r===0}i.schema=o;export{i as validate10};
