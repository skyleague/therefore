/**
 * Generated by @skyleague/therefore
 * eslint-disable
 */
"use strict";module.exports = validate10;module.exports.default = validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"Pet","type":"object","properties":{"id":{"type":"integer","title":"id"},"name":{"type":"string","title":"name"},"category":{"title":"category","$ref":"#/$defs/Category7d17"},"photoUrls":{"type":"array","title":"photoUrls","items":{"type":"string"}},"tags":{"type":"array","title":"tags","items":{"$ref":"#/$defs/Tag7d17"}},"status":{"title":"status","description":"pet status in the store","enum":["available","pending","sold"]}},"required":["name","photoUrls"],"additionalProperties":true,"$defs":{"Category7d17":{"type":"object","title":"Category7d17","properties":{"id":{"type":"integer","title":"id"},"name":{"type":"string","title":"name"}},"additionalProperties":true},"Tag7d17":{"type":"object","title":"Tag7d17","properties":{"id":{"type":"integer","title":"id"},"name":{"type":"string","title":"name"}},"additionalProperties":true}}};const schema12 = {"type":"object","title":"Category7d17","properties":{"id":{"type":"integer","title":"id"},"name":{"type":"string","title":"name"}},"additionalProperties":true};const schema13 = {"type":"object","title":"Tag7d17","properties":{"id":{"type":"integer","title":"id"},"name":{"type":"string","title":"name"}},"additionalProperties":true};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){let missing0;if(((data.name === undefined) && (missing0 = "name")) || ((data.photoUrls === undefined) && (missing0 = "photoUrls"))){validate10.errors = [{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: missing0},message:"must have required property '"+missing0+"'"}];return false;}else {if(data.id !== undefined){let data0 = data.id;const _errs2 = errors;if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){validate10.errors = [{instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];return false;}var valid0 = _errs2 === errors;}else {var valid0 = true;}if(valid0){if(data.name !== undefined){const _errs4 = errors;if(typeof data.name !== "string"){validate10.errors = [{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid0 = _errs4 === errors;}else {var valid0 = true;}if(valid0){if(data.category !== undefined){let data2 = data.category;const _errs6 = errors;const _errs7 = errors;if(errors === _errs7){if(data2 && typeof data2 == "object" && !Array.isArray(data2)){if(data2.id !== undefined){let data3 = data2.id;const _errs10 = errors;if(!(((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3))) && (isFinite(data3)))){validate10.errors = [{instancePath:instancePath+"/category/id",schemaPath:"#/$defs/Category7d17/properties/id/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];return false;}var valid2 = _errs10 === errors;}else {var valid2 = true;}if(valid2){if(data2.name !== undefined){const _errs12 = errors;if(typeof data2.name !== "string"){validate10.errors = [{instancePath:instancePath+"/category/name",schemaPath:"#/$defs/Category7d17/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid2 = _errs12 === errors;}else {var valid2 = true;}}}else {validate10.errors = [{instancePath:instancePath+"/category",schemaPath:"#/$defs/Category7d17/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid0 = _errs6 === errors;}else {var valid0 = true;}if(valid0){if(data.photoUrls !== undefined){let data5 = data.photoUrls;const _errs14 = errors;if(errors === _errs14){if(Array.isArray(data5)){var valid3 = true;const len0 = data5.length;for(let i0=0; i0<len0; i0++){const _errs16 = errors;if(typeof data5[i0] !== "string"){validate10.errors = [{instancePath:instancePath+"/photoUrls/" + i0,schemaPath:"#/properties/photoUrls/items/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid3 = _errs16 === errors;if(!valid3){break;}}}else {validate10.errors = [{instancePath:instancePath+"/photoUrls",schemaPath:"#/properties/photoUrls/type",keyword:"type",params:{type: "array"},message:"must be array"}];return false;}}var valid0 = _errs14 === errors;}else {var valid0 = true;}if(valid0){if(data.tags !== undefined){let data7 = data.tags;const _errs18 = errors;if(errors === _errs18){if(Array.isArray(data7)){var valid4 = true;const len1 = data7.length;for(let i1=0; i1<len1; i1++){let data8 = data7[i1];const _errs20 = errors;const _errs21 = errors;if(errors === _errs21){if(data8 && typeof data8 == "object" && !Array.isArray(data8)){if(data8.id !== undefined){let data9 = data8.id;const _errs24 = errors;if(!(((typeof data9 == "number") && (!(data9 % 1) && !isNaN(data9))) && (isFinite(data9)))){validate10.errors = [{instancePath:instancePath+"/tags/" + i1+"/id",schemaPath:"#/$defs/Tag7d17/properties/id/type",keyword:"type",params:{type: "integer"},message:"must be integer"}];return false;}var valid6 = _errs24 === errors;}else {var valid6 = true;}if(valid6){if(data8.name !== undefined){const _errs26 = errors;if(typeof data8.name !== "string"){validate10.errors = [{instancePath:instancePath+"/tags/" + i1+"/name",schemaPath:"#/$defs/Tag7d17/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"}];return false;}var valid6 = _errs26 === errors;}else {var valid6 = true;}}}else {validate10.errors = [{instancePath:instancePath+"/tags/" + i1,schemaPath:"#/$defs/Tag7d17/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}var valid4 = _errs20 === errors;if(!valid4){break;}}}else {validate10.errors = [{instancePath:instancePath+"/tags",schemaPath:"#/properties/tags/type",keyword:"type",params:{type: "array"},message:"must be array"}];return false;}}var valid0 = _errs18 === errors;}else {var valid0 = true;}if(valid0){if(data.status !== undefined){let data11 = data.status;const _errs28 = errors;if(!(((data11 === "available") || (data11 === "pending")) || (data11 === "sold"))){validate10.errors = [{instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema11.properties.status.enum},message:"must be equal to one of the allowed values"}];return false;}var valid0 = _errs28 === errors;}else {var valid0 = true;}}}}}}}}else {validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate10.errors = vErrors;return errors === 0;};validate10.schema=schema11;