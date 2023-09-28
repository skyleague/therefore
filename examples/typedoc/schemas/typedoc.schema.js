/**
 * Generated by Ajv https://ajv.js.org/guide/managing-schemas.html#standalone-validation-code 
 * eslint-disable
 */
const validate=validate10;var stdin_default=validate10;const schema11={"$schema":"http://json-schema.org/draft-07/schema#","title":"JSON Schema for typedoc.json","type":"object","properties":{"disableOutputCheck":{"type":"boolean","description":"Should TypeDoc disable the testing and cleaning of the output directory?","default":false},"entryPoint":{"type":"string","description":"Specifies the fully qualified name of the root symbol.","default":"./"},"exclude":{"type":"array","description":"Exclude files by the given pattern when a path is provided as source. Supports minimatch patterns.","items":{"type":"string"}},"excludeExternals":{"type":"boolean","description":"Prevent externally resolved TypeScript files from being documented.","default":false},"excludeNotExported":{"type":"boolean","description":"Prevent symbols that are not exported from being documented.","default":false},"excludePrivate":{"type":"boolean","description":"Ignores private variables and methods","default":false},"excludeProtected":{"type":"boolean","description":"Ignores protected variables and methods","default":false},"externalPattern":{"type":"array","description":"Define a pattern for files that should be considered being external.","items":{"type":"string"}},"gaID":{"type":"string","description":"Set the Google Analytics tracking ID and activate tracking code."},"gaSite":{"type":"string","description":"Set the site name for Google Analytics.","default":"auto"},"gitRevision":{"type":"string","description":"Use specified revision or branch instead of the last revision for linking to GitHub source files."},"hideGenerator":{"type":"boolean","description":"Do not print the TypeDoc link at the end of the page.","default":false},"ignoreCompilerErrors":{"type":"boolean","description":"Generates documentation, even if the project does not TypeScript compile.","default":false},"includeDeclarations":{"type":"boolean","description":"Turn on parsing of .d.ts declaration files.","default":false},"includes":{"type":"string","description":"Specifies the location to look for included documents (use [[include:FILENAME]] in comments)."},"inputFiles":{"type":"array","description":"The sources files from which to build documentation.","items":{"type":"string"}},"json":{"type":"string","description":"Specifies the location to output a JSON file containing all of the reflection data."},"listInvalidSymbolLinks":{"type":"boolean","description":"Emits a list of broken symbol [[navigation]] links after documentation generation","default":false},"logger":{"description":"Specify the logger that should be used.","default":"console","enum":["console","none"]},"media":{"type":"string","description":"Specifies the location with media files that should be copied to the output directory."},"mode":{"description":"Specifies the output mode the project is used to be compiled with.","default":"modules","enum":["file","modules"]},"name":{"type":"string","description":"Set the name of the project that will be used in the header of the template."},"out":{"type":"string","description":"Specifies the location the documentation should be written to."},"plugin":{"$ref":"#/$defs/Plugin7ac8"},"includeVersion":{"type":"boolean","description":"Add the package version according to package.json to the projects name.","default":false},"excludeTags":{"type":"array","description":"Specify tags that should be removed from doc comments when parsing.","default":[],"items":{"type":"string"}},"readme":{"$ref":"#/$defs/Readme7ac8"},"src":{"$ref":"#/$defs/Src7ac8"},"stripInternal":{"type":"boolean","description":"Remove reflections annotated with @internal","default":false},"theme":{"$ref":"#/$defs/Theme"},"toc":{"type":"array","description":"Specifies the top level table of contents.","items":{"type":"string"}},"tsconfig":{"type":"string","description":"Specify a typescript config file that should be loaded. If not specified TypeDoc will look for 'tsconfig.json' in the current directory.","default":"./tsconfig.json"}},"required":["exclude","externalPattern","gaID","gitRevision","includes","inputFiles","json","media","name","out","plugin","readme","src","theme","toc"],"additionalProperties":true,"$defs":{"Plugin7ac8":{"title":"Plugin7ac8","description":"Specify the npm plugins that should be loaded. Omit to load all installed plugins.","anyOf":[{"type":"array","default":["none"],"items":{"type":"string"}}]},"Readme7ac8":{"title":"Readme7ac8","description":"Path to the readme file that should be displayed on the index page. Pass none to disable the index page and start the documentation on the globals page.","anyOf":[{"const":"none"},{"type":"string"}]},"Src7ac8":{"title":"Src7ac8","description":"The sources files from which to build documentation.\nDEPRECATED: Use inputFiles instead.","anyOf":[{"type":"string"},{"type":"array","items":{"type":"string"}}]},"Theme":{"title":"Theme","description":"Specify the path to the theme that should be used.","anyOf":[{"enum":["default","minimal"]},{"type":"string"}]}}};const schema12={"title":"Plugin7ac8","description":"Specify the npm plugins that should be loaded. Omit to load all installed plugins.","anyOf":[{"type":"array","default":["none"],"items":{"type":"string"}}]};const schema13={"title":"Readme7ac8","description":"Path to the readme file that should be displayed on the index page. Pass none to disable the index page and start the documentation on the globals page.","anyOf":[{"const":"none"},{"type":"string"}]};const schema14={"title":"Src7ac8","description":"The sources files from which to build documentation.\nDEPRECATED: Use inputFiles instead.","anyOf":[{"type":"string"},{"type":"array","items":{"type":"string"}}]};const schema15={"title":"Theme","description":"Specify the path to the theme that should be used.","anyOf":[{"enum":["default","minimal"]},{"type":"string"}]};function validate10(data,{instancePath="",parentData,parentDataProperty,rootData=data}={}){let vErrors=null;let errors=0;if(errors===0){if(data&&typeof data=="object"&&!Array.isArray(data)){if(data.disableOutputCheck===void 0){data.disableOutputCheck=false}if(data.entryPoint===void 0){data.entryPoint="./"}if(data.excludeExternals===void 0){data.excludeExternals=false}if(data.excludeNotExported===void 0){data.excludeNotExported=false}if(data.excludePrivate===void 0){data.excludePrivate=false}if(data.excludeProtected===void 0){data.excludeProtected=false}if(data.gaSite===void 0){data.gaSite="auto"}if(data.hideGenerator===void 0){data.hideGenerator=false}if(data.ignoreCompilerErrors===void 0){data.ignoreCompilerErrors=false}if(data.includeDeclarations===void 0){data.includeDeclarations=false}if(data.listInvalidSymbolLinks===void 0){data.listInvalidSymbolLinks=false}if(data.logger===void 0){data.logger="console"}if(data.mode===void 0){data.mode="modules"}if(data.includeVersion===void 0){data.includeVersion=false}if(data.excludeTags===void 0){data.excludeTags=[]}if(data.stripInternal===void 0){data.stripInternal=false}if(data.tsconfig===void 0){data.tsconfig="./tsconfig.json"}let missing0;let valid0=true;for(missing0 of schema11.required){valid0=data[missing0]!==void 0;if(!valid0){validate10.errors=[{instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty:missing0},message:"must have required property '"+missing0+"'"}];return false;break}}if(valid0){const _errs2=errors;if(typeof data.disableOutputCheck!=="boolean"){validate10.errors=[{instancePath:instancePath+"/disableOutputCheck",schemaPath:"#/properties/disableOutputCheck/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"}];return false}var valid1=_errs2===errors;if(valid1){const _errs4=errors;if(typeof data.entryPoint!=="string"){validate10.errors=[{instancePath:instancePath+"/entryPoint",schemaPath:"#/properties/entryPoint/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid1=_errs4===errors;if(valid1){if(data.exclude!==void 0){let data2=data.exclude;const _errs6=errors;if(errors===_errs6){if(Array.isArray(data2)){var valid2=true;const len0=data2.length;for(let i0=0;i0<len0;i0++){const _errs8=errors;if(typeof data2[i0]!=="string"){validate10.errors=[{instancePath:instancePath+"/exclude/"+i0,schemaPath:"#/properties/exclude/items/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid2=_errs8===errors;if(!valid2){break}}}else{validate10.errors=[{instancePath:instancePath+"/exclude",schemaPath:"#/properties/exclude/type",keyword:"type",params:{type:"array"},message:"must be array"}];return false}}var valid1=_errs6===errors}else{var valid1=true}if(valid1){const _errs10=errors;if(typeof data.excludeExternals!=="boolean"){validate10.errors=[{instancePath:instancePath+"/excludeExternals",schemaPath:"#/properties/excludeExternals/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"}];return false}var valid1=_errs10===errors;if(valid1){const _errs12=errors;if(typeof data.excludeNotExported!=="boolean"){validate10.errors=[{instancePath:instancePath+"/excludeNotExported",schemaPath:"#/properties/excludeNotExported/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"}];return false}var valid1=_errs12===errors;if(valid1){const _errs14=errors;if(typeof data.excludePrivate!=="boolean"){validate10.errors=[{instancePath:instancePath+"/excludePrivate",schemaPath:"#/properties/excludePrivate/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"}];return false}var valid1=_errs14===errors;if(valid1){const _errs16=errors;if(typeof data.excludeProtected!=="boolean"){validate10.errors=[{instancePath:instancePath+"/excludeProtected",schemaPath:"#/properties/excludeProtected/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"}];return false}var valid1=_errs16===errors;if(valid1){if(data.externalPattern!==void 0){let data8=data.externalPattern;const _errs18=errors;if(errors===_errs18){if(Array.isArray(data8)){var valid3=true;const len1=data8.length;for(let i1=0;i1<len1;i1++){const _errs20=errors;if(typeof data8[i1]!=="string"){validate10.errors=[{instancePath:instancePath+"/externalPattern/"+i1,schemaPath:"#/properties/externalPattern/items/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid3=_errs20===errors;if(!valid3){break}}}else{validate10.errors=[{instancePath:instancePath+"/externalPattern",schemaPath:"#/properties/externalPattern/type",keyword:"type",params:{type:"array"},message:"must be array"}];return false}}var valid1=_errs18===errors}else{var valid1=true}if(valid1){if(data.gaID!==void 0){const _errs22=errors;if(typeof data.gaID!=="string"){validate10.errors=[{instancePath:instancePath+"/gaID",schemaPath:"#/properties/gaID/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid1=_errs22===errors}else{var valid1=true}if(valid1){const _errs24=errors;if(typeof data.gaSite!=="string"){validate10.errors=[{instancePath:instancePath+"/gaSite",schemaPath:"#/properties/gaSite/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid1=_errs24===errors;if(valid1){if(data.gitRevision!==void 0){const _errs26=errors;if(typeof data.gitRevision!=="string"){validate10.errors=[{instancePath:instancePath+"/gitRevision",schemaPath:"#/properties/gitRevision/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid1=_errs26===errors}else{var valid1=true}if(valid1){const _errs28=errors;if(typeof data.hideGenerator!=="boolean"){validate10.errors=[{instancePath:instancePath+"/hideGenerator",schemaPath:"#/properties/hideGenerator/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"}];return false}var valid1=_errs28===errors;if(valid1){const _errs30=errors;if(typeof data.ignoreCompilerErrors!=="boolean"){validate10.errors=[{instancePath:instancePath+"/ignoreCompilerErrors",schemaPath:"#/properties/ignoreCompilerErrors/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"}];return false}var valid1=_errs30===errors;if(valid1){const _errs32=errors;if(typeof data.includeDeclarations!=="boolean"){validate10.errors=[{instancePath:instancePath+"/includeDeclarations",schemaPath:"#/properties/includeDeclarations/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"}];return false}var valid1=_errs32===errors;if(valid1){if(data.includes!==void 0){const _errs34=errors;if(typeof data.includes!=="string"){validate10.errors=[{instancePath:instancePath+"/includes",schemaPath:"#/properties/includes/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid1=_errs34===errors}else{var valid1=true}if(valid1){if(data.inputFiles!==void 0){let data17=data.inputFiles;const _errs36=errors;if(errors===_errs36){if(Array.isArray(data17)){var valid4=true;const len2=data17.length;for(let i2=0;i2<len2;i2++){const _errs38=errors;if(typeof data17[i2]!=="string"){validate10.errors=[{instancePath:instancePath+"/inputFiles/"+i2,schemaPath:"#/properties/inputFiles/items/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid4=_errs38===errors;if(!valid4){break}}}else{validate10.errors=[{instancePath:instancePath+"/inputFiles",schemaPath:"#/properties/inputFiles/type",keyword:"type",params:{type:"array"},message:"must be array"}];return false}}var valid1=_errs36===errors}else{var valid1=true}if(valid1){if(data.json!==void 0){const _errs40=errors;if(typeof data.json!=="string"){validate10.errors=[{instancePath:instancePath+"/json",schemaPath:"#/properties/json/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid1=_errs40===errors}else{var valid1=true}if(valid1){const _errs42=errors;if(typeof data.listInvalidSymbolLinks!=="boolean"){validate10.errors=[{instancePath:instancePath+"/listInvalidSymbolLinks",schemaPath:"#/properties/listInvalidSymbolLinks/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"}];return false}var valid1=_errs42===errors;if(valid1){let data21=data.logger;const _errs44=errors;if(!(data21==="console"||data21==="none")){validate10.errors=[{instancePath:instancePath+"/logger",schemaPath:"#/properties/logger/enum",keyword:"enum",params:{allowedValues:schema11.properties.logger.enum},message:"must be equal to one of the allowed values"}];return false}var valid1=_errs44===errors;if(valid1){if(data.media!==void 0){const _errs45=errors;if(typeof data.media!=="string"){validate10.errors=[{instancePath:instancePath+"/media",schemaPath:"#/properties/media/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid1=_errs45===errors}else{var valid1=true}if(valid1){let data23=data.mode;const _errs47=errors;if(!(data23==="file"||data23==="modules")){validate10.errors=[{instancePath:instancePath+"/mode",schemaPath:"#/properties/mode/enum",keyword:"enum",params:{allowedValues:schema11.properties.mode.enum},message:"must be equal to one of the allowed values"}];return false}var valid1=_errs47===errors;if(valid1){if(data.name!==void 0){const _errs48=errors;if(typeof data.name!=="string"){validate10.errors=[{instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid1=_errs48===errors}else{var valid1=true}if(valid1){if(data.out!==void 0){const _errs50=errors;if(typeof data.out!=="string"){validate10.errors=[{instancePath:instancePath+"/out",schemaPath:"#/properties/out/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid1=_errs50===errors}else{var valid1=true}if(valid1){if(data.plugin!==void 0){let data26=data.plugin;const _errs52=errors;const _errs54=errors;let valid6=false;const _errs55=errors;if(errors===_errs55){if(Array.isArray(data26)){var valid7=true;const len3=data26.length;for(let i3=0;i3<len3;i3++){const _errs57=errors;if(typeof data26[i3]!=="string"){const err0={instancePath:instancePath+"/plugin/"+i3,schemaPath:"#/$defs/Plugin7ac8/anyOf/0/items/type",keyword:"type",params:{type:"string"},message:"must be string"};if(vErrors===null){vErrors=[err0]}else{vErrors.push(err0)}errors++}var valid7=_errs57===errors;if(!valid7){break}}}else{const err1={instancePath:instancePath+"/plugin",schemaPath:"#/$defs/Plugin7ac8/anyOf/0/type",keyword:"type",params:{type:"array"},message:"must be array"};if(vErrors===null){vErrors=[err1]}else{vErrors.push(err1)}errors++}}var _valid0=_errs55===errors;valid6=valid6||_valid0;if(!valid6){const err2={instancePath:instancePath+"/plugin",schemaPath:"#/$defs/Plugin7ac8/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};if(vErrors===null){vErrors=[err2]}else{vErrors.push(err2)}errors++;validate10.errors=vErrors;return false}else{errors=_errs54;if(vErrors!==null){if(_errs54){vErrors.length=_errs54}else{vErrors=null}}}var valid1=_errs52===errors}else{var valid1=true}if(valid1){const _errs59=errors;if(typeof data.includeVersion!=="boolean"){validate10.errors=[{instancePath:instancePath+"/includeVersion",schemaPath:"#/properties/includeVersion/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"}];return false}var valid1=_errs59===errors;if(valid1){let data29=data.excludeTags;const _errs61=errors;if(errors===_errs61){if(Array.isArray(data29)){var valid8=true;const len4=data29.length;for(let i4=0;i4<len4;i4++){const _errs63=errors;if(typeof data29[i4]!=="string"){validate10.errors=[{instancePath:instancePath+"/excludeTags/"+i4,schemaPath:"#/properties/excludeTags/items/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid8=_errs63===errors;if(!valid8){break}}}else{validate10.errors=[{instancePath:instancePath+"/excludeTags",schemaPath:"#/properties/excludeTags/type",keyword:"type",params:{type:"array"},message:"must be array"}];return false}}var valid1=_errs61===errors;if(valid1){if(data.readme!==void 0){let data31=data.readme;const _errs65=errors;const _errs67=errors;let valid10=false;const _errs68=errors;if("none"!==data31){const err3={instancePath:instancePath+"/readme",schemaPath:"#/$defs/Readme7ac8/anyOf/0/const",keyword:"const",params:{allowedValue:"none"},message:"must be equal to constant"};if(vErrors===null){vErrors=[err3]}else{vErrors.push(err3)}errors++}var _valid1=_errs68===errors;valid10=valid10||_valid1;if(!valid10){const _errs69=errors;if(typeof data31!=="string"){const err4={instancePath:instancePath+"/readme",schemaPath:"#/$defs/Readme7ac8/anyOf/1/type",keyword:"type",params:{type:"string"},message:"must be string"};if(vErrors===null){vErrors=[err4]}else{vErrors.push(err4)}errors++}var _valid1=_errs69===errors;valid10=valid10||_valid1}if(!valid10){const err5={instancePath:instancePath+"/readme",schemaPath:"#/$defs/Readme7ac8/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};if(vErrors===null){vErrors=[err5]}else{vErrors.push(err5)}errors++;validate10.errors=vErrors;return false}else{errors=_errs67;if(vErrors!==null){if(_errs67){vErrors.length=_errs67}else{vErrors=null}}}var valid1=_errs65===errors}else{var valid1=true}if(valid1){if(data.src!==void 0){let data32=data.src;const _errs71=errors;const _errs73=errors;let valid12=false;const _errs74=errors;if(typeof data32!=="string"){const err6={instancePath:instancePath+"/src",schemaPath:"#/$defs/Src7ac8/anyOf/0/type",keyword:"type",params:{type:"string"},message:"must be string"};if(vErrors===null){vErrors=[err6]}else{vErrors.push(err6)}errors++}var _valid2=_errs74===errors;valid12=valid12||_valid2;if(!valid12){const _errs76=errors;if(errors===_errs76){if(Array.isArray(data32)){var valid13=true;const len5=data32.length;for(let i5=0;i5<len5;i5++){const _errs78=errors;if(typeof data32[i5]!=="string"){const err7={instancePath:instancePath+"/src/"+i5,schemaPath:"#/$defs/Src7ac8/anyOf/1/items/type",keyword:"type",params:{type:"string"},message:"must be string"};if(vErrors===null){vErrors=[err7]}else{vErrors.push(err7)}errors++}var valid13=_errs78===errors;if(!valid13){break}}}else{const err8={instancePath:instancePath+"/src",schemaPath:"#/$defs/Src7ac8/anyOf/1/type",keyword:"type",params:{type:"array"},message:"must be array"};if(vErrors===null){vErrors=[err8]}else{vErrors.push(err8)}errors++}}var _valid2=_errs76===errors;valid12=valid12||_valid2}if(!valid12){const err9={instancePath:instancePath+"/src",schemaPath:"#/$defs/Src7ac8/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};if(vErrors===null){vErrors=[err9]}else{vErrors.push(err9)}errors++;validate10.errors=vErrors;return false}else{errors=_errs73;if(vErrors!==null){if(_errs73){vErrors.length=_errs73}else{vErrors=null}}}var valid1=_errs71===errors}else{var valid1=true}if(valid1){const _errs80=errors;if(typeof data.stripInternal!=="boolean"){validate10.errors=[{instancePath:instancePath+"/stripInternal",schemaPath:"#/properties/stripInternal/type",keyword:"type",params:{type:"boolean"},message:"must be boolean"}];return false}var valid1=_errs80===errors;if(valid1){if(data.theme!==void 0){let data35=data.theme;const _errs82=errors;const _errs84=errors;let valid15=false;const _errs85=errors;if(!(data35==="default"||data35==="minimal")){const err10={instancePath:instancePath+"/theme",schemaPath:"#/$defs/Theme/anyOf/0/enum",keyword:"enum",params:{allowedValues:schema15.anyOf[0].enum},message:"must be equal to one of the allowed values"};if(vErrors===null){vErrors=[err10]}else{vErrors.push(err10)}errors++}var _valid3=_errs85===errors;valid15=valid15||_valid3;if(!valid15){const _errs86=errors;if(typeof data35!=="string"){const err11={instancePath:instancePath+"/theme",schemaPath:"#/$defs/Theme/anyOf/1/type",keyword:"type",params:{type:"string"},message:"must be string"};if(vErrors===null){vErrors=[err11]}else{vErrors.push(err11)}errors++}var _valid3=_errs86===errors;valid15=valid15||_valid3}if(!valid15){const err12={instancePath:instancePath+"/theme",schemaPath:"#/$defs/Theme/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};if(vErrors===null){vErrors=[err12]}else{vErrors.push(err12)}errors++;validate10.errors=vErrors;return false}else{errors=_errs84;if(vErrors!==null){if(_errs84){vErrors.length=_errs84}else{vErrors=null}}}var valid1=_errs82===errors}else{var valid1=true}if(valid1){if(data.toc!==void 0){let data36=data.toc;const _errs88=errors;if(errors===_errs88){if(Array.isArray(data36)){var valid16=true;const len6=data36.length;for(let i6=0;i6<len6;i6++){const _errs90=errors;if(typeof data36[i6]!=="string"){validate10.errors=[{instancePath:instancePath+"/toc/"+i6,schemaPath:"#/properties/toc/items/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid16=_errs90===errors;if(!valid16){break}}}else{validate10.errors=[{instancePath:instancePath+"/toc",schemaPath:"#/properties/toc/type",keyword:"type",params:{type:"array"},message:"must be array"}];return false}}var valid1=_errs88===errors}else{var valid1=true}if(valid1){const _errs92=errors;if(typeof data.tsconfig!=="string"){validate10.errors=[{instancePath:instancePath+"/tsconfig",schemaPath:"#/properties/tsconfig/type",keyword:"type",params:{type:"string"},message:"must be string"}];return false}var valid1=_errs92===errors}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}else{validate10.errors=[{instancePath,schemaPath:"#/type",keyword:"type",params:{type:"object"},message:"must be object"}];return false}}validate10.errors=vErrors;return errors===0};validate.schema=schema11;export{stdin_default as default,validate};
