# Vonage API - Voice enabling a text-only chatbot

This sample application allows to place or receive voice calls to/from a phone user and interact with a text-only chatbot via voice, thus voice enabling a text-only chatbot.

This application uses Vonage Voice API for speech recognition and text to speech capabalities to listen to user's requests and play chatbot replies.

## About this sample application

This sample application makes use of Vonage Voice API to answer incoming or place voice calls.

The reference connection code will:
- Will use Vonage Voice API to do ASR (Automatic Speech Recognition) on caller's speech and get the transcript,
- Send the transcript to a very simple text chatbot for demo purpose. In this case, the very simple text chatbot is coded in the associated code source file listed below,
- Receive the corresponding text answer from the simple chatbot,
- Generate voice reply to user using Vonage Voice API TTS (Text-to-Speech).

Once this application will be running, you call in to the **`phone number linked`** to your application (as explained below) to interact via voice with your chatbot.</br>

## Set up the simple chatbot - Host server public hostname and port

First set up the very simple text chatbot from https://github.com/nexmo-se/voice-enabling-text-bot-connecting-ref-vapi-asr.

Default local (not public!) reference connection code `port` is: 5000.

If you plan to test using `Local deployment` with ngrok (Internet tunneling service) for both the simple chatbot sample server and this sample application, you may set up [multiple ngrok tunnels](https://ngrok.com/docs#multiple-tunnels).

For the next steps, you will need:
- The simple chatbot server's public hostname and if necessary public port,</br>
e.g. `xxxxxxxx.ngrok.io`, `xxxxxxxx.herokuapp.com`, `myserver.mycompany.com:32000`  (as **`BOT_SRV`**, no `port` is necessary with ngrok or heroku as public hostname)

## Set up your Vonage Voice API application credentials and phone number

[Log in to your](https://dashboard.nexmo.com/sign-in) or [sign up for a](https://dashboard.nexmo.com/sign-up) Vonage APIs account.

Go to [Your applications](https://dashboard.nexmo.com/applications), access an existing application or [+ Create a new application](https://dashboard.nexmo.com/applications/new).

Under Capabilities section (click on [Edit] if you do not see this section):

Enable Voice
- Under Answer URL, leave HTTP GET, and enter https://\<host\>:\<port\>/answer (replace \<host\> and \<port\> with the public host name and if necessary public port of the server where this sample application is running)</br>
- Under Event URL, **select** HTTP POST, and enter https://\<host\>:\<port\>/event (replace \<host\> and \<port\> with the public host name and if necessary public port of the server where this sample application is running)</br>
Note: If you are using ngrok for this sample application, the answer URL and event URL look like:</br>
https://yyyyyyyy.ngrok.io/answer</br>
https://yyyyyyyy.ngrok.io/event</br> 	
- Click on [Generate public and private key] if you did not yet create or want new ones, save the private.key file in this application folder.</br>
**IMPORTANT**: Do not forget to click on [Save changes] at the bottom of the screen if you have created a new key set.</br>
- Link a phone number to this application if none has been linked to the application.

Please take note of your **application ID** and the **linked phone number** (as they are needed in the very next section.)

For the next steps, you will need:</br>
- Your [Vonage API key](https://dashboard.nexmo.com/settings) (as **`API_KEY`**)</br>
- Your [Vonage API secret](https://dashboard.nexmo.com/settings), not signature secret, (as **`API_SECRET`**)</br>
- Your `application ID` (as **`APP_ID`**),</br>
- The **`phone number linked`** to your application (as **`SERVICE_NUMBER`**), your phone will **call that number**,</br>
- The Simple Text-Only chatbot server public hostname and port (as **`BOT_SERVER`**), in this demo code, it has the same argument as for ASR_SERVER, the argument is without any http:// nor https:// prefix, without any trailing slash, or sub-path</br>

## Overview on how this sample Voice API application works

- On an incoming call to the **`phone number linked`** to your application, GET `/answer` route plays a TTS greeting to the caller ("action": "talk"), 

- You may customize the inital text sent to your chatbot to correspond to your chatbot programming and use case.

- Chatbot responses will be received by this application.</br>


## Running this sample Voice API application

You may select one of the following 2 types of deployments.

### Local deployment

To run your own instance of this sample application locally, you'll need an up-to-date version of Node.js (we tested with version 14.3.0).

Download this sample application code to a local folder, then go to that folder.

Copy the `env.example` file over to a new file called `.env`:
```bash
cp env.example .env
```

Edit `.env` file, and set the five parameter values:</br>
API_KEY=</br>
API_SECRET=</br>
APP_ID=</br>
BOT_SERVER=</br>
SERVICE_NUMBER=</br>


Install dependencies once:
```bash
npm install
```

Launch the applicatiom:
```bash
node voice-on-text-bot-app-with-simple-bot
```

### Command Line Heroku deployment

You must first have deployed your application locally, as explained in previous section, and verified it is working.

Install [git](https://git-scm.com/downloads).

Install [Heroku command line](https://devcenter.heroku.com/categories/command-line) and login to your Heroku account.

If you do not yet have a local git repository, create one:</br>
```bash
git init
git add .
git commit -am "initial"
```

Start by creating this application on Heroku from the command line using the Heroku CLI:

```bash
heroku create myappname
```

Note: In above command, replace "myappname" with a unique name on the whole Heroku platform.

On your Heroku dashboard where your application page is shown, click on `Settings` button,
add the following `Config Vars` and set them with their respective values:</br>
API_KEY</br>
API_SECRET</br>
APP_ID</br>
BOT_SERVER</br>
SERVICE_NUMBER</br>
PRIVATE_KEY_FILE with the value ./private.key</br>

Now, deploy the application:


```bash
git push heroku master
```

On your Heroku dashboard where your application page is shown, click on `Open App` button, that hostname is the one to be used under your corresponding [Vonage Voice API application Capabilities](https://dashboard.nexmo.com/applications) (click on your application, then [Edit]).</br>

For example, the respective links would be like:</br>
https://myappname.herokuapp.com/answer</br>
https://myappname.herokuapp.com/event</br>

See more details in above section **Set up your Vonage Voice API application credentials and phone number**.


From any phone, dial the Vonage number (the one in the .env file).  This will connect the caller, and the user able to have voice interact with the text chatbot via voice.

### Connecting server code to use

To simulate the voice interaction with a text-only chatbot, you may use only the connecting code (from https://github.com/nexmo-se/voice-enabling-text-bot-connecting-ref-vapi-asr)
```bash
node very-simple-bot.js
```
with the client application
```bash 
node voice-on-text-bot-app-with-simple-bot.js
```

------------------

To just see the ASR results, you may use either of the connecting code (from https://github.com/nexmo-se/voice-enabling-text-bot-connecting-ref-vapi-asr)
```bash
node very-simple-bot.js
```

with the client application
```bash 
node voice-on-text-bot-app-generic.js
```

of course, you would need to add your own code in this client application to interact with your actual text-only chatbot.
