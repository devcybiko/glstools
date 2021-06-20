// args(options, posnparms, dieOnFailure) -> {opts}
//   options: 
//       NOTE: the biggest mistake people make is that all --options are arrays of values
//       --name: a boolean option, no value assignment allowed
//          returns true if the option is specified
//          opts.name is 'truthy' if specified,
//          opts.name will be undefined if --name is never encountered
//       --name#: a boolean option, no value assignment allowed
//          returns an array of [true,...] for each time --name appears
//          opts.name is 'truthy' if specified,
//          opts.name will be undefined if --name is never encountered
//          opts.name.length === number of times --name is encounterd
//       --name=: an option that requires a value 
//          returns 'value' for the LAST TIME --name=value appears
//          '--name=' returns the empty string
//          '--name' is an error
//       --name#=: an array option that requires a value 
//          returns [value,...] for each time --name=value appears
//          '--name=' returns the empty string
//          '--name' is an error
//       --name#=defaultValue: an option that requires a value and has a default value
//          returns [value,...] for each time --name=value appears
//          if the '--name=somevalue' is not given, opts.name => [defaultValue]
//       --name*=: an option that is required (must not have a default value)
//          returns 'value' for the LAST TIME --name=value appears
//          returns an error if '--name=somevalue' does not appear
//       --name-n=default: an option --name with an alias -n
//          works exactly the same as all above - but both --name and -n are respected on the cmdline
//       -name: a single-dash option (defined exactly the same as --name, but with only one dash)
//          works exactly the same as all above - except -name is respected on the cmdline
//          (usually reserved for boolean options eg: -a, -b, etc...
//       NOTE: Sadly, composing multiple boolean options in one query is not permitted
//          Example: ls -latr ### the 4 boolean options -l -a -t -r are #not# handled by gprocs.args
//   fileparms:
//      name: returns opts.name for the positional parm passed in
//      name*: required positional parm
//      name=default: default value for positional parm
//      name*=default: invalid - logically, you cannot have a required positinal parm that also has a default value
//   dieOnFailure: true => prints errors and usage.
//   opts:
//      opts._errors = an array of erroneous inputs
//      opts._files = an array of all non-option inputs on the cmdline
//   EXAMPLE: opts = args("-a,-b=,-centry-c=c.default,-d*=,-e=,-f=,--extra-x,-g*=,-h=h.default", "one,two*,three=three.default,four");

function usage(optionString = "", parmString = "") {
    let procname = process.argv[1];
    let i = procname.lastIndexOf("/");
    procname = procname.substring(i + 1);
    let s = `USAGE: ${procname} ${optionString} ${parmString}`;
    return s;
}

const args = function (optionString = "", parmString = "", andDie = true) {
    let options = parseOptions(optionString);
    let parmlist = parseParms(parmString);
    // console.log({ options, parmlist });
    let results = { _files: [], _errors: [] };
    let nparm = 0;
    let usageString = usage(optionString, parmString);

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
            let name = option && option.name;

            if (!option) {
                results._errors.push(`Unknown option: ${dashName}`);
                continue;
            }
            if (option.isBoolean) {
                if (hasEquals) {
                    results._errors.push(`boolean option '${dashName}' cannot accept a value after '=' (=${value})`);
                    continue
                } else {
                    value = true;
                }
            } else { // requires a value
                if (!hasEquals) {
                    results._errors.push(`value option '${dashName}' requires an '=' sign`);
                    continue;
                }
                if (option.required && !value) {
                    results._errors.push(`value option '${dashName}=' requires a value after '=' sign`);
                    continue;
                }
                // if (value === "" && option.defaultValue) value = option.defaultValue;
                // otherwise, use the value specified `value = words[1];`
            }
            if (option.array) {
                results[name] = results[name] || []; // create an array if it doesn't exist
                results[name].push(value);
            } else {
                results[name] = value;
            }
        } else {
            // ordered parameter
            if (nparm < parmlist.length) {
                let parm = parmlist[nparm++];
                results[parm.name] = arg;
            }
            results._files.push(arg);
        }
    }
    //console.log(results);
    // check for required options
    for (let key of Object.keys(options)) {
        let opt = options[key];
        if (opt.required && !results[opt.name]) results._errors.push(`Missing required option: ${key}`);
        if (opt.defaultValue && !results[opt.name]) results[opt.name] = opt.array ? [opt.defaultValue] : opt.defaultValue;
    }

    // check for required parms
    for (let parm of parmlist) {
        if (parm.required && !results[parm.name]) results._errors.push(`Missing required positional parameter: ${parm.name}`);
        if (!results[parm.name]) results[parm.name] = parm.defaultValue; // all positional parms have at least a default parameter
    }
    if (results._errors.length === 0) delete (results._errors);
    if (andDie && results._errors) die(`${results._errors.join("\n")}\n${usageString}`);
    return results;
}

function trimOption(option) {
    let required = false;
    let array = false;
    let dashName = option;
    let aliasName;
    dashes = 0;
    let name = option;
    if (name[0] !== '-') throw ("options must start with a dash (-) " + name);
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
    if (name[name.length - 1] === '#') {
        name = name.substring(0, name.length - 1);
        dashName = dashName.substring(0, dashName.length - 1);
        array = true;
    }
    let words = name.split("-", 2); // handle aliases
    if (words.length > 1) {
        name = words[0];
        aliasName = "-" + words[1];
        dashName = "--".substring(0, dashes) + name;
    }

    return { name, required, array, dashName, aliasName };
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
        let isBoolean = !hasEquals;
        let words = optionItem.split("=", 2);
        let optionDefinition = words[0];
        let defaultValue = words[1];
        let { name, required, array, dashName, aliasName } = trimOption(optionDefinition);
        if (required && isBoolean) throw (`you cannot require boolean option '${dashName}*'`);
        if (required && !isBoolean && defaultValue) throw (`you cannot require a value option '${dashName}*' and give it a default value '${defaultValue}'`);
        options[dashName] = {
            name,
            required,
            array,
            defaultValue,
            isBoolean: isBoolean
        };
        if (aliasName) options[aliasName] = options[dashName];
    }
    return options;
}

function parseParms(parmString) {
    let parms = [];
    let parmList = parmString.split(",");
    let cnt = 0;
    let errors = [];
    for (let parmName of parmList) {
        if (!parmName) continue;
        let words = parmName.split("=", 2);
        let { name, required } = trimParm(words[0]);
        let defaultValue = words[1];
        if (required && defaultValue) throw ("You cannot do both: require a positional parmeter, and give it a default value: " + parmName);
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

function die(msg, rc = 1) {
    console.error("\n" + msg + "\n");
    process.exit(rc);
}

function test() {
    let opts = "-a#,-b#=,-centry-c#=c.default,-d#*=,-e#=,-f=,--extra-x,-g*=,-h=h.default";
    let parms = "one,two*,three=three.default,four";
    process.argv = [
        "node",
        "glsprocs.js",
        "-a", "-a", "-b=", "-b=funstuff", "-c", "-c=", "-c=value", "foo", "bar", "-d", "-d=", "-d=d-value", "-f=first", "-f=test", "-x", "-other", "--extra"
    ];
    try {
        let options = args("-g*=required", parms, false);
        console.assert(false, "-g*=required did not throw an exception");
    } catch (ex) {
        console.assert(ex.toString() === "you cannot require a value option '-g*' and give it a default value 'required'", "-g*=required did not throw the correct exception");
    }
    try {
        let options = args("-z*", parms, false);
        console.assert(false, "-z* did not throw an exception");
    } catch (ex) {
        console.assert(ex.toString() === "you cannot require boolean option '-z*'", "-z* did not throw the correct exception");
    }
    let options = args(opts, parms, false);
    // console.log(options._errors);
    console.assert(options._files[0] === "foo", "missing first file");
    console.assert(options._files[1] === "bar", "missing second file");
    console.assert(options._files.length === 2, `wrong number of files ${options._files.length}`);
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
    console.assert(options.centry.length === 2, "-centry (-c) should have 2 values");
    console.assert(options.centry[0] === "", "-centry[0] have the empty value");
    console.assert(options.centry[1] === "value", "-centry[1] should have the 'value'");
    console.assert(options.d, "-d should be specified at least once");
    console.assert(options.d.length === 1, "-d should be specified at least once");
    console.assert(options.d[0] === "d-value", "-d[0] should be 'value'");
    console.assert(options.e === undefined, `-e should not be present ${options.e}`);
    console.assert(options.f, "-f should be assigned");
    console.assert(options.f === 'test', "-f should be  'test'");
    console.assert(options.h === 'h.default', "-h should be 'h.default'");
    console.assert(!!options.extra === true, "-extra or -x should be specified");
    console.assert(options._errors.length === 5, "there should be 5 errors");
    // console.log(JSON.stringify(options));
    // console.log(opts);
    // console.log(JSON.stringify(process.argv));

}

// test();

module.exports = args;