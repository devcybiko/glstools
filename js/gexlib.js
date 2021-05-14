const __gfiles = require('./glsfiles.js');

__peek = function(arr) {
    return arr.length === 0 ? undefined : arr[arr.length-1];
}

let __env = process.env
let __Fs=[];
let __Fe=[];
let __currfile=[];

function __die(s, rc) {
    console.error(s);
    process.exit(rc);
}

function __ignore(s, end="") {
    return end;
}

function __lines(s, start, end) {
    let lines = s.split("\n");
    lines = lines.slice(start,end);
    return lines.join("");
}

function __include(fname, fs, fe, __parms={}, __depth=16) {
    for(let __key of Object.keys(__parms)) {
        let __value = __parms[__key];
        eval(`${__key}=${JSON.stringify(__value)}`);
    }

    __currfile.push(fname);
    fs = fs || __peek(__Fs);
    fe = fe || __peek(__Fe);
    __Fs.push(fs);
    __Fe.push(fe);
    let __text = __gfiles.read("${includePath}:"+fname, __env);
    if (__text === null) __die(`ERROR: could not read file "${__currfile.pop()} from file "${__currfile.pop()}" with include path: "${__env.includePath}"`, 1);
    let result = __expand(__text, fs, fe, __parms, __depth);
    __currfile.pop();
    __Fs.pop();
    __Fe.pop();
    return result;
}

/**
 * NOTE: This is an include method for use inside a macro - it is not called from here
 **/
function __insert(fname) {
    __currfile.push(fname);
    let __text = __gfiles.read("${includePath}:"+fname, __env);
    if (__text === null) __die(`ERROR: could not read file "${fname}" in include path: "${__env.includePath}"`, 1);
    __currfile.pop(fname);
    return __text;
}


function __expand(__text, fs, fe, __parms={},__depth=16) {
    if (__depth === 0) return __text;
    if (typeof __text !== "string") return "";
    for(let __key of Object.keys(__parms)) {
        let __value = __parms[__key];
        eval(`${__key}=${JSON.stringify(__value)}`);
    }

    let __result = "";
    let __last = 0;
    let __value;
    let __expr;
    let __regexp = new RegExp(`${fs}(.*?)${fe}`,"msg");
    let __matches = __text.matchAll(__regexp);
    for(let __match of __matches) {
        try {
            __expr = __match[1];
            __value = eval(__expr);
            if (__value === undefined) throw new Error("Undefined Result upon eval()");
            if (__expr.substring(0,2) !== "__") __value = __expand(__value, fs, fe, __parms, __depth-1); // expand the result if it's not a directive
        } catch(error) {
            console.error(error);
            __value = undefined;
        }
        if (__value === undefined) __die(`JavaScript could not parse the following string from file ${__currfile.pop()} \n${__expr}`, 1);
        __result += __text.substring(__last, __match.index) + __value;
        __last = __match.index + __match[0].length;
    }
    __result += __text.substring(__last);
    return __result;
}


module.exports = {expand: __expand, include: __include};
