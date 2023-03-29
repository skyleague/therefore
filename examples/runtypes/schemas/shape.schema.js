/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
const schema11={"$schema":"http://json-schema.org/draft-07/schema#","title":"Shape","anyOf":[{"$ref":"#/$defs/Square"},{"$ref":"#/$defs/Rectangle"},{"$ref":"#/$defs/Circle"}],"$defs":{"Square":{"type":"object","properties":{"size":{"type":"number"}},"required":["size"],"additionalProperties":true,"title":"Square"},"Rectangle":{"type":"object","properties":{"width":{"type":"number"},"height":{"type":"number"}},"required":["width","height"],"additionalProperties":true,"title":"Rectangle"},"Circle":{"type":"object","properties":{"radius":{"type":"number"}},"required":["radius"],"additionalProperties":true,"title":"Circle"}}};const schema12={"type":"object","properties":{"size":{"type":"number"}},"required":["size"],"additionalProperties":true,"title":"Square"};const schema13={"type":"object","properties":{"width":{"type":"number"},"height":{"type":"number"}},"required":["width","height"],"additionalProperties":true,"title":"Rectangle"};const schema14={"type":"object","properties":{"radius":{"type":"number"}},"required":["radius"],"additionalProperties":true,"title":"Circle"};function validate10(data,{instancePath="",parentData,parentDataProperty,rootData=data}={}){let vErrors=null;let errors=0;const _errs0=errors;let valid0=false;const _errs1=errors;const _errs2=errors;if(errors===_errs2){if(data&&typeof data=="object"&&!Array.isArray(data)){let missing0;if(data.size===void 0&&(missing0="size")){const err0={instancePath,schemaPath:"#/$defs/Square/required",keyword:"required",params:{missingProperty:missing0},message:"must have required property '"+missing0+"'"};if(vErrors===null){vErrors=[err0]}else{vErrors.push(err0)}errors++}else{if(data.size!==void 0){let data0=data.size;if(!(typeof data0=="number"&&isFinite(data0))){const err1={instancePath:instancePath+"/size",schemaPath:"#/$defs/Square/properties/size/type",keyword:"type",params:{type:"number"},message:"must be number"};if(vErrors===null){vErrors=[err1]}else{vErrors.push(err1)}errors++}}}}else{const err2={instancePath,schemaPath:"#/$defs/Square/type",keyword:"type",params:{type:"object"},message:"must be object"};if(vErrors===null){vErrors=[err2]}else{vErrors.push(err2)}errors++}}var _valid0=_errs1===errors;valid0=valid0||_valid0;if(!valid0){const _errs7=errors;const _errs8=errors;if(errors===_errs8){if(data&&typeof data=="object"&&!Array.isArray(data)){let missing1;if(data.width===void 0&&(missing1="width")||data.height===void 0&&(missing1="height")){const err3={instancePath,schemaPath:"#/$defs/Rectangle/required",keyword:"required",params:{missingProperty:missing1},message:"must have required property '"+missing1+"'"};if(vErrors===null){vErrors=[err3]}else{vErrors.push(err3)}errors++}else{if(data.width!==void 0){let data1=data.width;const _errs11=errors;if(!(typeof data1=="number"&&isFinite(data1))){const err4={instancePath:instancePath+"/width",schemaPath:"#/$defs/Rectangle/properties/width/type",keyword:"type",params:{type:"number"},message:"must be number"};if(vErrors===null){vErrors=[err4]}else{vErrors.push(err4)}errors++}var valid4=_errs11===errors}else{var valid4=true}if(valid4){if(data.height!==void 0){let data2=data.height;const _errs13=errors;if(!(typeof data2=="number"&&isFinite(data2))){const err5={instancePath:instancePath+"/height",schemaPath:"#/$defs/Rectangle/properties/height/type",keyword:"type",params:{type:"number"},message:"must be number"};if(vErrors===null){vErrors=[err5]}else{vErrors.push(err5)}errors++}var valid4=_errs13===errors}else{var valid4=true}}}}else{const err6={instancePath,schemaPath:"#/$defs/Rectangle/type",keyword:"type",params:{type:"object"},message:"must be object"};if(vErrors===null){vErrors=[err6]}else{vErrors.push(err6)}errors++}}var _valid0=_errs7===errors;valid0=valid0||_valid0;if(!valid0){const _errs15=errors;const _errs16=errors;if(errors===_errs16){if(data&&typeof data=="object"&&!Array.isArray(data)){let missing2;if(data.radius===void 0&&(missing2="radius")){const err7={instancePath,schemaPath:"#/$defs/Circle/required",keyword:"required",params:{missingProperty:missing2},message:"must have required property '"+missing2+"'"};if(vErrors===null){vErrors=[err7]}else{vErrors.push(err7)}errors++}else{if(data.radius!==void 0){let data3=data.radius;if(!(typeof data3=="number"&&isFinite(data3))){const err8={instancePath:instancePath+"/radius",schemaPath:"#/$defs/Circle/properties/radius/type",keyword:"type",params:{type:"number"},message:"must be number"};if(vErrors===null){vErrors=[err8]}else{vErrors.push(err8)}errors++}}}}else{const err9={instancePath,schemaPath:"#/$defs/Circle/type",keyword:"type",params:{type:"object"},message:"must be object"};if(vErrors===null){vErrors=[err9]}else{vErrors.push(err9)}errors++}}var _valid0=_errs15===errors;valid0=valid0||_valid0}}if(!valid0){const err10={instancePath,schemaPath:"#/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};if(vErrors===null){vErrors=[err10]}else{vErrors.push(err10)}errors++;validate10.errors=vErrors;return false}else{errors=_errs0;if(vErrors!==null){if(_errs0){vErrors.length=_errs0}else{vErrors=null}}}validate10.errors=vErrors;return errors===0};validate10.schema=schema11;export{validate10};
