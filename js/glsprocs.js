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

    // args(options, posnparms, dieOnFailure) -> {opts}
    //   options: 
    //       --name: an atomic option, no value assignment allowed (returns an array of [true,...] for each time --name appears)
    //       --name=: an option that requires a value (returns [value,...] for each time --name=value appears
    //       --name=default: an option that requires a value and has a default if not specified
    //       --name*=default: an option that is required and has a default value (returns [value,...])
    //       --name-n*=default: an option --name with an alias -n
    //       -n: a simple option (defined exactly the same as --name, but with only one dash)
    //   fileparms:
    //      name: returns opts.name for the positional parm passed in
    //      name*: required positional parm
    //      name=default: default value for positional parm
    //      name*=default: invalid - logically, you cannot have a required positinal parm that also has a default
    // args("--opt1=default,--opt2*,--opt3,-o,--opt4-o=default", "infile*,outfile=a.jnk");
    //  
    //     options, positional parameters, *:required, '=':value required, value after '=' is default value if not supplied
    //     NOTE: --opt-o => -o is alias for --opt
    // returns an object as follows:
    // {
    //   files: [...] // all non-option args in order
    //   optname: [...] // array of all -opt=value options (always at least an empty list if specified)
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
                let dashName = words[0];
                let value = words[1];
                let option = options[dashName];
                if (!option) {
                    results._errors.push(`Unknown option: ${dashName}`);
                    continue;
                }
                if (option.valueRequired) {
                    if (hasEquals) {
                        value = value; // nop
                    } else {
                        value = option.defaultValue;
                    }
                } else {
                    if (hasEquals) {
                        results._errors.push(`atomic option '${dashName}' cannot accept a value after '=' (=${value})`);
                        continue
                    } else {
                        value = true;
                    }
                }
                let name = option.name;
                results[name] = results[name] || []; // create an array if it doesn't exist
                results[name].push(value); // options are always a list
                console.log({name, value, results})
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
    let dashName = option;
    let aliasName;
    dashes = 0;
    let name = option;
    if (name[0] !== '-') this.die("options must start with a dash (-) " + name);
    name = name.substring(1); // trim off the leading dash
    dashes++;
    if (name[0] === '-') {
        name = name.substring(1); // trim off the second leading dash
        dashes++;
    }
    if (name[name.length - 1] === '*') {
        // required option
        name = name.substring(0, name.length - 1);
        dashName = dashName.substring(0, dashName.length - 1);
        required = true;
    }
    let words = name.split("-", 2); // handle aliases
    if (words.length > 1) {
        name = words[0];
        aliasName = "-" + words[1];
        dashName = "--".substring(0, dashes) + name;
    }

    return { name, required, dashName, aliasName };
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
        if (!optionItem) continue;
        let hasEquals = optionItem.indexOf("=") !== -1;
        let words = optionItem.split("=", 2);
        let optionDefinition = words[0];
        let defaultValue = words[1];
        let { name, required, dashName, aliasName } = trimOption(optionDefinition);
        if (required && !hasEquals) module.exports.die(`you cannot require option '${dashName}*' without also specifying '='`);
        options[dashName] = {
            name,
            required,
            defaultValue,
            valueRequired: hasEquals
        };
        if (aliasName) options[aliasName] = options[dashName];
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
    let opts = "--extra-x,-a,-b=,-centry-c=c.default,-d*=_empty_,-e=e.default,-f=,-g*=required";
    let parms = "one,two*,three=three.default,four";
    process.argv = [
        "node",
        "glsprocs.js",
        "-a", "-b=", "foo", "bar", "-b=funstuff", "-c=", "-c", "-d", "-d=", "-d=d-value", "-f=test", "-x", "-other", "--extra"
    ];
    let options = module.exports.args(opts, parms, false);
    console.log(options._errors);
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
    console.assert(options.b[0] === "", "-b[0] should be the empty string '' ");
    console.assert(options.b[1] === "funstuff", "-b[0] should be funstuff");
    console.assert(options.centry, "-centry (-c) should be specified");
    console.assert(options.centry[0] === "", "-c[0] should be empty");
    console.assert(options.centry[1] === "c.default", "-c[1] should be c.default");
    console.assert(options.d, "-d should be specified at least once");
    console.assert(options.d[0] === "_empty_", "-d[0] should be _empty_");
    console.assert(options.d[1] === "", "-d[1] should be ''");
    console.assert(options.d[2] === "d-value", "-d[d] should be d-value");
    console.assert(options.e === undefined, "-e should not be present");
    console.assert(options.f.length === 1, "-f should be assigned");
    console.assert(options.f[0] === '', "-f should be the empty string");
    console.assert(!!options.x === true, "-extra-x should be specified");
    console.assert(options._errors.length === 2, "there should be 2 errors");
    console.assert(options._errors[0] === 'Unknown option: -other', "__errors should report 'Unknown option: -other'");
    console.assert(options._errors[1] === 'Missing required option: -g', "__errors should report 'Missing required option: -g'");
    console.log("a: " + JSON.stringify(options.a));
    console.log("b: " + JSON.stringify(options.b));
    console.log("c: " + JSON.stringify(options.centry));
    console.log("d: " + JSON.stringify(options.d));
    console.log("e: " + JSON.stringify(options.e));
    console.log("f: " + JSON.stringify(options.f));
    console.log("g: " + JSON.stringify(options.f));
    console.log("x: " + JSON.stringify(options.x));
    console.log("extra: " + JSON.stringify(options.extra));
    console.log(opts);
    console.log(JSON.stringify(process.argv));

}

test();