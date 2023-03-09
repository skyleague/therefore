/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
"use strict";module.exports = validate10;module.exports.default = validate10;const schema11 = {"$schema":"http://json-schema.org/draft-07/schema#","title":"comic","type":"object","properties":{"alt":{"type":["string","null"],"title":"alt","nullable":true},"day":{"type":["string","null"],"title":"day","nullable":true},"img":{"type":["string","null"],"title":"img","nullable":true},"link":{"type":["string","null"],"title":"link","nullable":true},"month":{"type":["string","null"],"title":"month","nullable":true},"news":{"type":["string","null"],"title":"news","nullable":true},"num":{"type":["number","null"],"title":"num","nullable":true},"safe_title":{"type":["string","null"],"title":"safe_title","nullable":true},"title":{"type":["string","null"],"title":"title","nullable":true},"transcript":{"type":["string","null"],"title":"transcript","nullable":true},"year":{"type":["string","null"],"title":"year","nullable":true}},"additionalProperties":true};function validate10(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(errors === 0){if(data && typeof data == "object" && !Array.isArray(data)){if(data.alt !== undefined){let data0 = data.alt;const _errs2 = errors;if((typeof data0 !== "string") && (data0 !== null)){validate10.errors = [{instancePath:instancePath+"/alt",schemaPath:"#/properties/alt/type",keyword:"type",params:{type: schema11.properties.alt.type},message:"must be string,null"}];return false;}var valid0 = _errs2 === errors;}else {var valid0 = true;}if(valid0){if(data.day !== undefined){let data1 = data.day;const _errs5 = errors;if((typeof data1 !== "string") && (data1 !== null)){validate10.errors = [{instancePath:instancePath+"/day",schemaPath:"#/properties/day/type",keyword:"type",params:{type: schema11.properties.day.type},message:"must be string,null"}];return false;}var valid0 = _errs5 === errors;}else {var valid0 = true;}if(valid0){if(data.img !== undefined){let data2 = data.img;const _errs8 = errors;if((typeof data2 !== "string") && (data2 !== null)){validate10.errors = [{instancePath:instancePath+"/img",schemaPath:"#/properties/img/type",keyword:"type",params:{type: schema11.properties.img.type},message:"must be string,null"}];return false;}var valid0 = _errs8 === errors;}else {var valid0 = true;}if(valid0){if(data.link !== undefined){let data3 = data.link;const _errs11 = errors;if((typeof data3 !== "string") && (data3 !== null)){validate10.errors = [{instancePath:instancePath+"/link",schemaPath:"#/properties/link/type",keyword:"type",params:{type: schema11.properties.link.type},message:"must be string,null"}];return false;}var valid0 = _errs11 === errors;}else {var valid0 = true;}if(valid0){if(data.month !== undefined){let data4 = data.month;const _errs14 = errors;if((typeof data4 !== "string") && (data4 !== null)){validate10.errors = [{instancePath:instancePath+"/month",schemaPath:"#/properties/month/type",keyword:"type",params:{type: schema11.properties.month.type},message:"must be string,null"}];return false;}var valid0 = _errs14 === errors;}else {var valid0 = true;}if(valid0){if(data.news !== undefined){let data5 = data.news;const _errs17 = errors;if((typeof data5 !== "string") && (data5 !== null)){validate10.errors = [{instancePath:instancePath+"/news",schemaPath:"#/properties/news/type",keyword:"type",params:{type: schema11.properties.news.type},message:"must be string,null"}];return false;}var valid0 = _errs17 === errors;}else {var valid0 = true;}if(valid0){if(data.num !== undefined){let data6 = data.num;const _errs20 = errors;if((!((typeof data6 == "number") && (isFinite(data6)))) && (data6 !== null)){validate10.errors = [{instancePath:instancePath+"/num",schemaPath:"#/properties/num/type",keyword:"type",params:{type: schema11.properties.num.type},message:"must be number,null"}];return false;}var valid0 = _errs20 === errors;}else {var valid0 = true;}if(valid0){if(data.safe_title !== undefined){let data7 = data.safe_title;const _errs23 = errors;if((typeof data7 !== "string") && (data7 !== null)){validate10.errors = [{instancePath:instancePath+"/safe_title",schemaPath:"#/properties/safe_title/type",keyword:"type",params:{type: schema11.properties.safe_title.type},message:"must be string,null"}];return false;}var valid0 = _errs23 === errors;}else {var valid0 = true;}if(valid0){if(data.title !== undefined){let data8 = data.title;const _errs26 = errors;if((typeof data8 !== "string") && (data8 !== null)){validate10.errors = [{instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: schema11.properties.title.type},message:"must be string,null"}];return false;}var valid0 = _errs26 === errors;}else {var valid0 = true;}if(valid0){if(data.transcript !== undefined){let data9 = data.transcript;const _errs29 = errors;if((typeof data9 !== "string") && (data9 !== null)){validate10.errors = [{instancePath:instancePath+"/transcript",schemaPath:"#/properties/transcript/type",keyword:"type",params:{type: schema11.properties.transcript.type},message:"must be string,null"}];return false;}var valid0 = _errs29 === errors;}else {var valid0 = true;}if(valid0){if(data.year !== undefined){let data10 = data.year;const _errs32 = errors;if((typeof data10 !== "string") && (data10 !== null)){validate10.errors = [{instancePath:instancePath+"/year",schemaPath:"#/properties/year/type",keyword:"type",params:{type: schema11.properties.year.type},message:"must be string,null"}];return false;}var valid0 = _errs32 === errors;}else {var valid0 = true;}}}}}}}}}}}}else {validate10.errors = [{instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"}];return false;}}validate10.errors = vErrors;return errors === 0;};validate10.schema=schema11;