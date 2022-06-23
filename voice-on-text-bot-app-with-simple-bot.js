'use strict'

//-------------

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const expressWs = require('express-ws')(app);
const Vonage = require('@vonage/server-sdk');
const { Readable } = require('stream');

// ------------------

// HTTP client
const webHookRequest = require('request');

const reqHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

 //---- CORS policy - Update this section as needed ----

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "OPTIONS,GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  next();
});

//-------

app.use(bodyParser.json());

//-------

let router = express.Router();
router.get('/', express.static('app'));
app.use('/app',router);

//------

const servicePhoneNumber = process.env.SERVICE_PHONE_NUMBER;

//-------------

const vonage = new Vonage({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  applicationId: process.env.APP_ID,
  privateKey: './.private.key'
});

//-------------

// Server hosting the very simple Bot to simulate interaction with a real Text Bot
const botServer = process.env.BOT_SERVER;
// this application will make HTTP POST requests to the URL https://<botServer>/bot
const botUrl = "https://" + botServer + "/bot";

//-------------

// Voice API ASR parameters
// See https://developer.nexmo.com/voice/voice-api/ncco-reference#speech-recognition-settings

const endOnSilence = 1.0; // adjust as needed for your user's voice interaction experience
const startTimeout = 10;  // adjust as needed for your user's voice interaction experience

//-------------

// Language locale settings

// For French samples
// const languageCode = process.env.LANGUAGE_CODE || 'fr-FR';
// const language = process.env.LANGUAGE || 'fr';
// const ttsStyle = process.env.TTS_STYLE || 6; // see https://developer.nexmo.com/voice/voice-api/guides/text-to-speech
// const greetingText = process.env.GREETING_TEXT || "Bonjour";
// const wakeUpBotText = process.env.WAKE_UP_BOT_TEXT || "Bonjour";
// const defaultBotGreetingText = process.env.DEFAULT_BOT_GREETING_TEXT || "Comment puis-je vous aider ?";

// For English samples
const languageCode = process.env.LANGUAGE_CODE || 'en-US';
const language = process.env.LANGUAGE || 'en';
const ttsStyle = process.env.TTS_STYLE || 11; // see https://developer.nexmo.com/voice/voice-api/guides/text-to-speech
const greetingText = process.env.GREETING_TEXT || "Hello";
const wakeUpBotText = process.env.WAKE_UP_BOT_TEXT || "Hello";
const defaultBotGreetingText = process.env.DEFAULT_BOT_GREETING_TEXT || "How may I help you?";

//-----------

console.log("Service phone number:", servicePhoneNumber);

//==========================================================

function reqCallback(error, response, body) {
    if (body != "Ok") {  
      console.log("HTTP request call status:", body);
    };  
}
 
//--- just testing making calls from a local request
app.get('/makecall', (req, res) => {

  res.status(200).send('Ok');

  const hostName = `${req.hostname}`;

  let callInfo;
  let reqOptions;

  callInfo = {
    'type': 'phone',
    'number': '12995550101',
    'x_param_1': 'foo1',
    'x_param_2': 'foo2'
  };

  console.log("callInfo:", JSON.stringify(callInfo));

  reqOptions = {
    url: 'https://' + hostName + '/placecall',
    method: 'POST',
    headers: reqHeaders,
    body: JSON.stringify(callInfo)
  };

  console.log("webHookRequest 1");
  console.log("userRequest:", userRequest);
  webHookRequest(reqOptions, reqCallback);

});

//-----------------

app.post('/placecall', (req, res) => {

  res.status(200).send('Ok');

  const hostName = `${req.hostname}`;
  const numberToCall = req.body.number;

  let xCustomFields = [];
  let customQueryParams = '';

  for (const [key, value] of Object.entries(req.body)) {
    console.log(`${key}: ${value}`);
    if (`${key}`.substring(0, 2) == 'x_') {
      xCustomFields.push(`${key}=${value}`);
    }
  }

  if (xCustomFields.length != 0) {
    customQueryParams = "&" + xCustomFields.join("&");
  };

  console.log('>>> custom query parameters in placecall:', customQueryParams);

  vonage.calls.create({
    to: [{
      type: 'phone',
      number: numberToCall
    }],
    from: {
     type: 'phone',
     number: servicePhoneNumber
    },
    answer_url: ['https://' + hostName + '/answer?language_code=' + languageCode + customQueryParams],
    answer_method: 'GET',
    event_url: ['https://' + hostName + '/event?language_code=' + languageCode + customQueryParams],
    event_method: 'POST'
    }, (err, res) => {
    if(err) {
      console.error(">>> outgoing call error:", err);
      console.error(err.body.title);
      console.error(err.body.invalid_parameters);
    } else {
      console.log(">>> outgoing call status:", res);
    }
  });

});

//-------

app.get('/answer', (req, res) => {

    const hostName = `${req.hostname}`;

    const uuid = req.query.uuid;

    app.set('botResponse_' + uuid, defaultBotGreetingText);  // in case text bot is unresponsive
    
    let nccoResponse = [
        {
          "action": "conversation",
          "name": "conference_" + uuid,
          "startOnEnter": true
        }
      ];

    // get welcome greeting from text bot

    const userRequest = {
      'id': uuid,  // to match corresponding call, metadata must be returned in reply from text bot
      'textRequest': wakeUpBotText,
      'language': language,
      'webhookUrl': 'https://' + hostName + '/botreply'
    };

    const reqOptions = {
      url: botUrl,
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify(userRequest)
    };

    webHookRequest(reqOptions, reqCallback);

    res.status(200).json(nccoResponse);

});


//-------

app.post('/event', (req, res) => {

  res.status(200).json({});

  if (req.body.status == "completed") {

    app.set('botResponse_' + req.body.uuid, undefined);

  }

});

//---------

app.post('/asr', (req, res) => {

  res.status(200).send('Ok');

  const uuid = req.body.uuid;
  const hostName = `${req.hostname}`;

  if (req.body.speech.hasOwnProperty('results')) {

    if(req.body.speech.results == undefined || req.body.speech.results.length < 1) {

      console.log(">>> No speech detected");

      if (req.body.speech.hasOwnProperty('timeout_reason')) {
        console.log('>>> ASR timeout reason:', req.body.speech.timeout_reason);
      }  

      // TO DO: need to set a default response in case bot never replies or with too much delay
      const ttsText = app.get('botResponse_' + uuid);

      console.log(">>> New ASR, text:", ttsText, "on call:", uuid);
      doNewAsr(uuid, ttsText, hostName);

    } else {

      const transcript = req.body.speech.results[0].text;
      console.log(">>> Detected spoken request:", transcript);

      const userRequest = {
        'id': uuid,  // to match corresponding call, metadata must be returned in reply from text bot
        'textRequest': transcript,  // user's request
        'language': language,
        'webhookUrl': 'https://' + hostName + '/botreply'
      };

      const reqOptions = {
        url: botUrl,
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify(userRequest)
      };

      // send request to text bot  
      webHookRequest(reqOptions, reqCallback);
    }  


  } else {


  if (req.body.speech.hasOwnProperty('timeout_reason')) {
    console.log('>>> ASR timeout reason:', req.body.speech.timeout_reason);
  }      

  if (req.body.speech.hasOwnProperty('error')) {
    console.log('>>> ASR error:', req.body.speech.error);
  }  

  const ttsText = app.get('botResponse_' + uuid);

  console.log(">>> New ASR, text:", ttsText, "on call:", uuid);
  doNewAsr(uuid, ttsText, hostName);

  };  

});

//------------

app.post('/botreply', (req, res) => {

  res.status(200).send('Ok');

  const hostName = `${req.hostname}`;

  const callUuid = req.body.id;

  // console.log('>>> Bot reply:', req.body);

  const botTextReponse = req.body.botTextReponse;

  console.log('>>>', botTextReponse);

  app.set('botResponse_' + callUuid, botTextReponse);

  doNewAsr(callUuid, botTextReponse, hostName);

});

//----------------------------------------

function doNewAsr(vapiCallUuid, ttsText, host) {

  vonage.calls.update(vapiCallUuid, {
    "action": "transfer",
    "destination":
      {
      "type": "ncco",
      "ncco":
        [
          {
          "action": "talk",
          "language": languageCode,
          "text": ttsText,
          "style": ttsStyle,
          "bargeIn": true
          }
          ,
          {
          "action": "input",  // see https://developer.nexmo.com/voice/voice-api/ncco-reference#speech-recognition-settings
          "eventUrl": ["https://" + host + "/asr"],
          "eventMethod": "POST",
          "type": ["speech"],  
          "speech":
            {
            "uuid": [vapiCallUuid], 
            "endOnSilence": endOnSilence, 
            "language": languageCode,
            "startTimeout": startTimeout
            } 
          }
          ,
          {
          "action": "conversation",
          "name": "conference_" + vapiCallUuid
          }   
        ]
      }
    }, (err, res) => {
       if (err) { console.error('Transfer', vapiCallUuid, 'error: ', err, err.body.invalid_parameters); }
       // else { console.log('Transfer', vapiCallUuid, 'status: ', res);}
  });

}

//=========================================

// app.use ('/', express.static(__dirname));

// app.get('/:name', function (req, res, next) {

//   let options = {
//     root: __dirname,
//     dotfiles: 'deny',
//     headers: {
//         'x-timestamp': Date.now(),
//         'x-sent': true
//     }
//   };

//   let fileName = req.params.name;
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log('Sent:', fileName);
//     }
//   });
// });

//-----------

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Voice API application listening on port ${port}!`));

//------------
