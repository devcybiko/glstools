const { execSync } = require('child_process');
module.exports = {
    /**
     * run the command and return the stdout
     * if there's an error, returns stderr
     */
    run: function (cmd) {
        let result = "Error..."
        try {
            result = execSync(cmd, { encoding: 'utf8' });
        } catch (e) {
            return e;
        }
        return result;
    },
    sleep$: async function (ms) { //note that the $ indicates it returns a promise - it's a$ynchronous
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    },
    die: function (msg, rc = 1) {
        console.error("\n" + msg + "\n");
        process.exit(rc);
    },
    usage: function (optionString = "", parmString = "") {
        let procname = process.argv[1];
        let i = procname.lastIndexOf("/");
        procname = procname.substring(i + 1);
        let s = `USAGE: ${procname} ${optionString} ${parmString}`;
        return s;
    },

    //
    // args("-opt1=default,-opt2*,-opt3", "infile*,outfile=a.jnk"); // options, positional parameters, *=required, '='=value expected, value after '=' is default value if not supplied
    // returns an object as follows:
    // {
    //   files: [...] // all non-option args in order
    //   optname: [...] // array of all -opt=value options (always at least an empty list)
    //   infile: value // positional parameters 
    //   outfile: value
    // }    
    args: function (optionString = "", parmString = "", andDie = true) {
        let options = parseOptions(optionString);
        let parmlist = parseParms(parmString);
        // console.log({ options, parmlist });
        let results = { files: [], _errors: [] };
        let nparm = 0;
        let usage = this.usage(optionString, parmString);

        // parse command line
        for (let i = 2; i < process.argv.length; i++) {
            let arg = process.argv[i];
            if (arg[0] === '-') {
                // its an option
                let hasEquals = arg.indexOf("=") !== -1;
                let words = arg.split("=", 2);
                let optionName = words[0];
                let value = words[1];
                if (!options[optionName]) {
                    results._errors.push(`Unknown option: ${optionName}`);
                    continue;
                }
                if (!hasEquals) value = options[optionName].defaultValue;
                let { name, required } = trimOption(optionName);
                results[name] = results[name] || []; // create an array if it doesn't exist
                results[name].push(value); // options are always a list
            } else {
                // ordered parameter
                if (nparm < parmlist.length) {
                    let parm = parmlist[nparm++];
                    results[parm.name] = arg;
                }
                results.files.push(arg);
            }
        }
        //console.log(results);
        // check for required options
        for (let key of Object.keys(options)) {
            let opt = options[key];
            if (opt.required && !results[opt.name]) results._errors.push(`Missing required option: ${key}`);
            if (!results[opt.name] && opt.defaultValue) results[opt.name] = [opt.defaultValue]; // add in the default values that you did not supply
        }

        // check for required parms
        for (let parm of parmlist) {
            if (parm.required && !results[parm.name]) results._errors.push(`Missing required positional parameter: ${parm.name}`);
            if (!results[parm.name]) results[parm.name] = parm.defaultValue; // all positional parms have at least a default parameter
        }
        if (results._errors.length === 0) delete (results._errors);
        if (andDie && results._errors) this.die(`${results._errors.join("\n")}\n${usage}`);
        return results;
    }
}

function trimOption(option) {
    let required = false;
    let optionName = option;
    let name = option;
    if (name[0] !== '-') this.die("options must start with a dash (-)");
    name = name.substring(1); // trim off the leading dash
    if (name[0] === '-') name = name.substring(1); // trim off the second leading dash
    if (name[name.length - 1] === '*') {
        // required option
        name = name.substring(0, name.length - 1);
        optionName = optionName.substring(0, optionName.length - 1);
        required = true;
    }
    return { name, required, optionName };
}

function trimParm(parm) {
    let required = false;
    let name = parm;
    if (parm[parm.length - 1] === '*') {
        // required option
        name = parm.substring(0, parm.length - 1);
        required = true;
    }
    return { name, required };
}

function parseOptions(optionString) {
    let options = {};
    let optionList = optionString.split(",");
    for (let optionItem of optionList) {
        let hasEquals = optionItem.indexOf("=") !== -1;
        let words = optionItem.split("=", 2);
        let optionDefinition = words[0];
        let defaultValue = words[1];
        if (!hasEquals) defaultValue = true;
        let { name, required, optionName } = trimOption(optionDefinition);
        options[optionName] = {
            name,
            required,
            defaultValue,
        };
    }
    return options;
}

function parseParms(parmString) {
    let parms = [];
    let parmList = parmString.split(",");
    let cnt = 0;
    for (let parmName of parmList) {
        if (!parmName) continue;
        let words = parmName.split("=", 2);
        let { name, required } = trimParm(words[0]);
        let defaultValue = words[1];
        if (required && defaultValue) module.exports.die("You cannot do both: require a positional parmeter, and give it a default value: " + parmName);
        let parm = {
            name,
            required,
            defaultValue,
            pos: cnt++
        };
        parms.push(parm);
    }
    return parms;
}

function test() {
    let opts = "-a,-b*,-c=c.default,-d*=_empty_,-e=e.default,-f=,-x";
    let parms = "one,two*,three=three.default,four";
    process.argv = [
        "node",
        "glsprocs.js",
        "-a", "-b", "foo", "bar", "-b=funstuff", "-c=", "-c", "-d", "-d=", "-d=d.default", "-f"
    ];
    let options = module.exports.args(opts, parms, false);
    //console.log({ options });
    console.assert(options.files[0] === "foo", "missing first file");
    console.assert(options.files[1] === "bar", "missing second file");
    console.assert(options.files.length === 2, `wrong number of files ${options.files.length}`);
    console.assert(options.one === "foo", "bad first parameter");
    console.assert(options.two === "bar", "bad second parameter");
    console.assert(options.three === "three.default", "bad third parameter");
    console.assert(options.four === undefined, "fourth positional parameter should be undefined");

    console.assert(!!options.a === true, "-a should be present");
    console.assert(options.b, "-b should be specified at least once");
    console.assert(options.b.length === 2, "-b should be specified twice");
    console.assert(options.b[0] === true, "-b[0] should be true");
    console.assert(options.b[1] === "funstuff", "-b[0] should be funstuff");
    console.assert(options.c, "-c should be specified");
    console.assert(options.c[0] === "", "-c[0] should be empty");
    console.assert(options.c[1] === "c.default", "-c[1] should be c.default");
    console.assert(options.d, "-d should be specified at least once");
    console.assert(options.d[0] === "_empty_", "-d[0] should be _empty_");
    console.assert(options.d[1] === "", "-d[1] should be ''");
    console.assert(options.d[2] === "d.default", "-d[d] should be d.default");
    console.assert(options.e === undefined, "-e should not be present");
    console.assert(options.f.length === 1, "-f should be assigned");
    console.assert(options.f[0] === '', "-f should be the empty string");
    console.assert(!!options.x === false, "-x should not be present");

    if (options.a) console.log("a: " + options.a);
    if (options.b) console.log("b: " + options.b);
    if (options.c) console.log("c: " + options.c);
    if (options.d) console.log("d: " + options.d);
    if (options.e) console.log("e: " + options.e);
    if (options.f) console.log("f: " + JSON.stringify(options.f));
    if (options.x) console.log("x: " + JSON.stringify(options.x));
}

//test();