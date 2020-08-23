const aws = require('./glsaws-aws.js');
const AWS = aws.AWS;
var fs = require("fs");

let Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-east-1'
});

let config = {
    rate: "100%", // ignored if newsBoolean = false;
    voiceID: 'Matthew',
    beforeBreakTime: "1s",
    afterBreakTime: "1s",
    newsBoolean: true,
};

function getPolly() {
    return Polly;
}

function setConfig(theConfig) {
    config = theConfig;
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
    console.log(params);

    await Polly.synthesizeSpeech(params, (err, data) => {
        if (err) throw err;
        if (!data) throw "polly failed to return data";
        if (!data.AudioStream instanceof Buffer) throw "polly returnd something other than a Buffer";
        fs.writeFileSync(outfname, data.AudioStream); // note: may throw its own exception
    });
}

async function pollySpeakSSML$(outfname, ssml, theConfig = config) {
    let engine = theConfig.newsBoolean ? "neural" : "standard";
    let params = {
        'Text': ssml,
        'TextType': 'ssml',
        'OutputFormat': 'mp3',
        'VoiceId': theConfig.voiceID,
        'Engine': engine
    }
    await pollySpeakRaw$(outfname, params);
}

async function pollySpeak$(text, outfname, theConfig = config) {
    let ssml = pollySSML(text, theConfig);
    await pollySpeakSSML$(ssml, outfname, theConfig)
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

