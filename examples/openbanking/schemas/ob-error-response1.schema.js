/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
const validate=validate10;var stdin_default=validate10;const schema11={"$schema":"http://json-schema.org/draft-07/schema#","title":"OBErrorResponse1","type":"object","description":"An array of detail error codes, and messages, and URLs to documentation to help remediation.","properties":{"Code":{"type":"string","title":"Code","description":"High level textual error code, to help categorize the errors.","minLength":1,"maxLength":40},"Errors":{"type":"array","title":"Errors","items":{"$ref":"#/$defs/OBError15d0c"},"minItems":1},"Id":{"type":"string","title":"Id","description":"A unique reference for the error instance, for audit purposes, in case of unknown/unclassified errors.","minLength":1,"maxLength":40},"Message":{"type":"string","title":"Message","description":"Brief Error message, e.g., 'There is something wrong with the request parameters provided'","minLength":1,"maxLength":500}},"required":["Code","Errors","Message"],"additionalProperties":true,"$defs":{"OBError15d0c":{"type":"object","title":"OBError15d0c","properties":{"ErrorCode":{"type":"string","title":"ErrorCode","description":"Low level textual error code, e.g., UK.OBIE.Field.Missing"},"Message":{"type":"string","title":"Message","description":"A description of the error that occurred. e.g., 'A mandatory field isn't supplied' or 'RequestedExecutionDateTime must be in future'\nOBIE doesn't standardise this field","minLength":1,"maxLength":500},"Path":{"type":"string","title":"Path","description":"Recommended but optional reference to the JSON Path of the field with error, e.g., Data.Initiation.InstructedAmount.Currency","minLength":1,"maxLength":500},"Url":{"type":"string","title":"Url","description":"URL to help remediate the problem, or provide more information, or to API Reference, or help etc"}},"required":["ErrorCode","Message"],"additionalProperties":true}}};const schema12={"type":"object","title":"OBError15d0c","properties":{"ErrorCode":{"type":"string","title":"ErrorCode","description":"Low level textual error code, e.g., UK.OBIE.Field.Missing"},"Message":{"type":"string","title":"Message","description":"A description of the error that occurred. e.g., 'A mandatory field isn't supplied' or 'RequestedExecutionDateTime must be in future'\nOBIE doesn't standardise this field","minLength":1,"maxLength":500},"Path":{"type":"string","title":"Path","description":"Recommended but optional reference to the JSON Path of the field with error, e.g., Data.Initiation.InstructedAmount.Currency","minLength":1,"maxLength":500},"Url":{"type":"string","title":"Url","description":"URL to help remediate the problem, or provide more information, or to API Reference, or help etc"}},"required":["ErrorCode","Message"],"additionalProperties":true};const func4=require("ajv/dist/runtime/ucs2length").default;function validate10(data,{instancePath="",parentData,parentDataProperty,rootData=data}={}){let vErrors=null;let errors=0;if(errors===0){if(data&&typeof data=="object"&&!Array.isArray(data)){let missing0;if(data.Code===void 0&&(missing0="Code")||data.Errors===void 0&&(missing0="Errors")||data.Message===void 0&&(missing0="Message")){validate10.errors=[{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty:missing0},message:"must have required property '"+missing0+"'"}];return false}else{if(data.Code!==void 0){let data0=data.Code;const _errs2=errors;if(errors===_errs2){if(typeof data0==="string"){if(func4(data0)>40){validate10.errors=[{instancePath:instancePath+"/Code",schemaPath:"#/properties/Code/maxLength",keyword:"maxLength",params:{limit:40},message:"must NOT have more than 40 characters"}];return false}else{if(func4(data0)<1){validate10.errors=[{instancePath:instancePath+"/Code",schemaPath:"#/properties/Code/minLength",keyword:"minLength",params:{limit:1},message:"must NOT have fewer than 1 characters"}];return false}}}else{validate10.errors=[{instancePath:instancePath+"/Code",schemaPath:"#/properties/Code/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}}var valid0=_errs2===errors}else{var valid0=true}if(valid0){if(data.Errors!==void 0){let data1=data.Errors;const _errs4=errors;if(errors===_errs4){if(Array.isArray(data1)){if(data1.length<1){validate10.errors=[{instancePath:instancePath+"/Errors",schemaPath:"#/properties/Errors/minItems",keyword:"minItems",params:{limit:1},message:"must NOT have fewer than 1 items"}];return false}else{var valid1=true;const len0=data1.length;for(let i0=0;i0<len0;i0++){let data2=data1[i0];const _errs6=errors;const _errs7=errors;if(errors===_errs7){if(data2&&typeof data2=="object"&&!Array.isArray(data2)){let missing1;if(data2.ErrorCode===void 0&&(missing1="ErrorCode")||data2.Message===void 0&&(missing1="Message")){validate10.errors=[{instancePath:instancePath+"/Errors/"+i0,schemaPath:"#/$defs/OBError15d0c/required",keyword:"required",params:{missingProperty:missing1},message:"must have required property '"+missing1+"'"}];return false}else{if(data2.ErrorCode!==void 0){const _errs10=errors;if(typeof data2.ErrorCode!=="string"){validate10.errors=[{instancePath:instancePath+"/Errors/"+i0+"/ErrorCode",schemaPath:"#/$defs/OBError15d0c/properties/ErrorCode/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid3=_errs10===errors}else{var valid3=true}if(valid3){if(data2.Message!==void 0){let data4=data2.Message;const _errs12=errors;if(errors===_errs12){if(typeof data4==="string"){if(func4(data4)>500){validate10.errors=[{instancePath:instancePath+"/Errors/"+i0+"/Message",schemaPath:"#/$defs/OBError15d0c/properties/Message/maxLength",keyword:"maxLength",params:{limit:500},message:"must NOT have more than 500 characters"}];return false}else{if(func4(data4)<1){validate10.errors=[{instancePath:instancePath+"/Errors/"+i0+"/Message",schemaPath:"#/$defs/OBError15d0c/properties/Message/minLength",keyword:"minLength",params:{limit:1},message:"must NOT have fewer than 1 characters"}];return false}}}else{validate10.errors=[{instancePath:instancePath+"/Errors/"+i0+"/Message",schemaPath:"#/$defs/OBError15d0c/properties/Message/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}}var valid3=_errs12===errors}else{var valid3=true}if(valid3){if(data2.Path!==void 0){let data5=data2.Path;const _errs14=errors;if(errors===_errs14){if(typeof data5==="string"){if(func4(data5)>500){validate10.errors=[{instancePath:instancePath+"/Errors/"+i0+"/Path",schemaPath:"#/$defs/OBError15d0c/properties/Path/maxLength",keyword:"maxLength",params:{limit:500},message:"must NOT have more than 500 characters"}];return false}else{if(func4(data5)<1){validate10.errors=[{instancePath:instancePath+"/Errors/"+i0+"/Path",schemaPath:"#/$defs/OBError15d0c/properties/Path/minLength",keyword:"minLength",params:{limit:1},message:"must NOT have fewer than 1 characters"}];return false}}}else{validate10.errors=[{instancePath:instancePath+"/Errors/"+i0+"/Path",schemaPath:"#/$defs/OBError15d0c/properties/Path/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}}var valid3=_errs14===errors}else{var valid3=true}if(valid3){if(data2.Url!==void 0){const _errs16=errors;if(typeof data2.Url!=="string"){validate10.errors=[{instancePath:instancePath+"/Errors/"+i0+"/Url",schemaPath:"#/$defs/OBError15d0c/properties/Url/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid3=_errs16===errors}else{var valid3=true}}}}}}else{validate10.errors=[{instancePath:instancePath+"/Errors/"+i0,schemaPath:"#/$defs/OBError15d0c/type",keyword:"type",params:{type:"object"},message:"must be object"}];return false}}var valid1=_errs6===errors;if(!valid1){break}}}}else{validate10.errors=[{instancePath:instancePath+"/Errors",schemaPath:"#/properties/Errors/type",keyword:"type",params:{type:"array"},message:"must be array"}];return false}}var valid0=_errs4===errors}else{var valid0=true}if(valid0){if(data.Id!==void 0){let data7=data.Id;const _errs18=errors;if(errors===_errs18){if(typeof data7==="string"){if(func4(data7)>40){validate10.errors=[{instancePath:instancePath+"/Id",schemaPath:"#/properties/Id/maxLength",keyword:"maxLength",params:{limit:40},message:"must NOT have more than 40 characters"}];return false}else{if(func4(data7)<1){validate10.errors=[{instancePath:instancePath+"/Id",schemaPath:"#/properties/Id/minLength",keyword:"minLength",params:{limit:1},message:"must NOT have fewer than 1 characters"}];return false}}}else{validate10.errors=[{instancePath:instancePath+"/Id",schemaPath:"#/properties/Id/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}}var valid0=_errs18===errors}else{var valid0=true}if(valid0){if(data.Message!==void 0){let data8=data.Message;const _errs20=errors;if(errors===_errs20){if(typeof data8==="string"){if(func4(data8)>500){validate10.errors=[{instancePath:instancePath+"/Message",schemaPath:"#/properties/Message/maxLength",keyword:"maxLength",params:{limit:500},message:"must NOT have more than 500 characters"}];return false}else{if(func4(data8)<1){validate10.errors=[{instancePath:instancePath+"/Message",schemaPath:"#/properties/Message/minLength",keyword:"minLength",params:{limit:1},message:"must NOT have fewer than 1 characters"}];return false}}}else{validate10.errors=[{instancePath:instancePath+"/Message",schemaPath:"#/properties/Message/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}}var valid0=_errs20===errors}else{var valid0=true}}}}}}else{validate10.errors=[{instancePath,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"}];return false}}validate10.errors=vErrors;return errors===0};validate.schema=schema11;export{stdin_default as default,validate};
