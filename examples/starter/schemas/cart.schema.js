/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
import {createRequire} from 'module';const require = createRequire(import.meta.url);"use strict";export const validate = validate10;export default validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"Cart","type":"object","properties":{"id":{"type":"string"},"items":{"type":"array","items":{"$ref":"#/$defs/CartItem"}},"createdAt":{"type":"string","format":"date-time"},"updatedAt":{"type":"string","format":"date-time"}},"required":["id","items","createdAt","updatedAt"],"additionalProperties":true,"$defs":{"CartItem":{"type":"object","properties":{"id":{"type":"string"},"name":{"type":"string"},"price":{"type":"number"},"size":{"$ref":"#/$defs/Size"}},"required":["id","name","price"],"additionalProperties":true,"title":"CartItem"},"Size":{"enum":["XS","S","M","L","XL"],"title":"Size"}}};const schema12 = {"type":"object","properties":{"id":{"type":"string"},"name":{"type":"string"},"price":{"type":"number"},"size":{"$ref":"#/$defs/Size"}},"required":["id","name","price"],"additionalProperties":true,"title":"CartItem"};const schema13 = {"enum":["XS","S","M","L","XL"],"title":"Size"};const func0 = require("ajv/dist/runtime/equal").default;function validate11(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if((((data.id === undefined) && (missing0 = "id")) || ((data.name === undefined) && (missing0 = "name"))) || ((data.price === undefined) && (missing0 = "price"))){validate11.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];return false;}else {if(data.id !== undefined){const _errs2 = errors;if(typeof data.id !== "string"){validate11.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid0 = _errs2 === errors;}else {var valid0 = true;}if(valid0){if(data.name !== undefined){const _errs4 = errors;if(typeof data.name !== "string"){validate11.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid0 = _errs4 === errors;}else {var valid0 = true;}if(valid0){if(data.price !== undefined){let data2 = data.price;const _errs6 = errors;if(!((typeof data2 == "number") && (isFinite(data2)))){validate11.errors = [{instancePath:instancePath+"/price",schemaPath:"#/properties/price/type",keyword:"type",params:{type: "number"},message:"must be number"}];return false;}var valid0 = _errs6 === errors;}else {var valid0 = true;}if(valid0){if(data.size !== undefined){const _errs8 = errors;let valid2;valid2 = false;for(const v0 of schema13.enum){if(func0(data.size, v0)){valid2 = true;break;}}if(!valid2){validate11.errors = [{instancePath:instancePath+"/size",schemaPath:"#/$defs/Size/enum",keyword:"enum",params:{allowedValues: schema13.enum},message:"must be equal to one of the allowed values"}];return false;}var valid0 = _errs8 === errors;}else {var valid0 = true;}}}}}}else {validate11.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate11.errors = vErrors;return errors === 0;}function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if(((((data.id === undefined) && (missing0 = "id")) || ((data.items === undefined) && (missing0 = "items"))) || ((data.createdAt === undefined) && (missing0 = "createdAt"))) || ((data.updatedAt === undefined) && (missing0 = "updatedAt"))){validate10.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];return false;}else {if(data.id !== undefined){const _errs2 = errors;if(typeof data.id !== "string"){validate10.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid0 = _errs2 === errors;}else {var valid0 = true;}if(valid0){if(data.items !== undefined){let data1 = data.items;const _errs4 = errors;if(errors === _errs4){if(Array.isArray(data1)){var valid1 = true;const len0 = data1.length;for(let i0=0; i0<len0; i0++){const _errs6 = errors;if(!(validate11(data1[i0], {instancePath:instancePath+"/items/" + i0,parentData:data1,parentDataProperty:i0,rootData}))){vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);errors = vErrors.length;}var valid1 = _errs6 === errors;if(!valid1){break;}}}else {validate10.errors = [{instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"}];return false;}}var valid0 = _errs4 === errors;}else {var valid0 = true;}if(valid0){if(data.createdAt !== undefined){const _errs7 = errors;if(errors === _errs7){if(errors === _errs7){if(!(typeof data.createdAt === "string")){validate10.errors = [{instancePath:instancePath+"/createdAt",schemaPath:"#/properties/createdAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}}}var valid0 = _errs7 === errors;}else {var valid0 = true;}if(valid0){if(data.updatedAt !== undefined){const _errs9 = errors;if(errors === _errs9){if(errors === _errs9){if(!(typeof data.updatedAt === "string")){validate10.errors = [{instancePath:instancePath+"/updatedAt",schemaPath:"#/properties/updatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}}}var valid0 = _errs9 === errors;}else {var valid0 = true;}}}}}}else {validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate10.errors = vErrors;return errors === 0;};validate.schema=schema11;