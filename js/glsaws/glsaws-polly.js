const aws = require('./glsaws-aws.js');
const AWS = aws.AWS;
var fs = require("fs");

let Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-east-1'
});

// Salli, Female (adolescent)
// Joanna, Female (alexa)
// Ivy, Female (child?)
// Kendra, Female (senior)
// Kimberly, Female (senior high pitched)
// Kevin, Male (adolescent, neural only)
// Matthew, Male (adult)
// Justin, Male (child)
// Joey, Male (adult)

let config = {
    rate: "100%",
    voiceID: 'Joanna',
    beforeBreakTime: null, // "1s", etc...
    afterBreakTime: null,
    newsBoolean: false,
    engine: null // "neural", "standard", overrides newsBoolean
};

function getPolly() {
    return Polly;
}

function setConfig(theConfig) {
    if (typeof theConfig === 'string') {
        let voices = theConfig.split(",");
        config.voiceID = voices[0] || 'Matthew';
        config.engine = voices[1] || 'neural';
        config.rate = voices[2] || '115%';
        config.newsBoolean = (voices[3] || 'true') === 'true';
    } else {
        config = theConfig;
    }
}

function getConfig() {
    return config;
}

function pollyInit(signatureVersion = "v4", region = "us-east-1", theConfig = config) {
    Polly = new AWS.Polly({
        signatureVersion: signatureVersion,
        region: region
    })
    config = theConfig;
    return Polly;
};

function pollySSML(s, theConfig = config) {
    let newsCaster = "";
    let newsCasterEnd = "";
    let rate = "";
    let rateEnd = "";
    let beforeBreakTime = theConfig.beforeBreakTime ? `<break time="${theConfig.beforeBreakTime}"/>` : "";
    let afterBreakTime = theConfig.afterBreakTime ? `<break time="${theConfig.afterBreakTime}"/>` : "";

    if (theConfig.newsBoolean) {
        newsCaster = '<amazon:domain name="news">';
        newsCasterEnd = '</amazon:domain>';
    }
    if (theConfig.rate) {
        rate = `<prosody rate="${theConfig.rate}">`
        rateEnd = `</prosody>`;
    }

    var text = `
    <speak>
    ${newsCaster}
    ${rate}
    ${beforeBreakTime}
    ${s}
    ${afterBreakTime}
    ${rateEnd}
    ${newsCasterEnd}
    </speak>`
    return text;
}



async function pollySpeakRaw$(outfname, params) {
    let promise = Polly.synthesizeSpeech(params).promise();
    await promise.then(function (data) {
        if (!data) throw "polly failed to return data";
        if (!data.AudioStream instanceof Buffer) throw "polly returnd something other than a Buffer";
        fs.writeFileSync(outfname, data.AudioStream); // note: may throw its own exception
    }); // errors should be thrown and caught upstream
}

async function pollySpeakSSML$(outfname, ssml, theConfig = config) {
    let engine = theConfig.newsBoolean ? "neural" : "standard";
    if (config.engine) engine = config.engine;

    let params = {
        'Text': ssml,
        'TextType': 'ssml',
        'OutputFormat': 'mp3',
        'VoiceId': theConfig.voiceID,
        'Engine': engine
    }
    await pollySpeakRaw$(outfname, params);
}

async function pollySpeak$(outfname, text, theConfig = config) {
    let ssml = pollySSML(text, theConfig);
    await pollySpeakSSML$(outfname, ssml, theConfig)
}

module.exports = {
    init: pollyInit,
    getPolly: getPolly,
    setConfig: setConfig,
    getConfig: getConfig,
    toSSML: pollySSML,
    speakRaw$: pollySpeakRaw$,
    speakSSML$: pollySpeakSSML$,
    speak$: pollySpeak$
};

