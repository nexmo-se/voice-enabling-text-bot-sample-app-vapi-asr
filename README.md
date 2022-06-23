# Vonage API - Voice enabling a text-only chatbot

This sample application allows placing or receiving voice calls to/from a phone and interact with a text-only chatbot via voice, thus voice enabling a text-only chatbot.

This application uses Vonage Voice API for speech recognition and text to speech capabalities to listen to user's requests and play chatbot replies.

## About this sample application

This sample application makes use of Vonage Voice API to answer incoming or place voice calls.

This application:
- Uses Vonage Voice API to do ASR (Automatic Speech Recognition) on caller's speech and get the transcript,
- Sends the transcript to a very simple text chatbot for demo purpose. In this case, the very simple text chatbot is coded in the associated code repository listed below,
- Receives the corresponding text answer from the simple chatbot,
- Generates voice reply to user using Vonage Voice API TTS (Text-to-Speech).

Once this application is running, you call in to the **`phone number linked`** to your application (as explained below) to interact via voice with your chatbot.</br>

## Set up the simple chatbot - Host server public hostname and port

First set up the very simple text chatbot from https://github.com/nexmo-se/voice-enabling-text-bot-connecting-ref-vapi-asr.

Default local (not public!) reference connection code `port` is: 6000.

### Local deployment using ngrok

If you plan to test using `Local deployment with ngrok` (Internet tunneling service) for both the simple chatbot sample server and this sample application, you may set up [multiple ngrok tunnels](https://ngrok.com/docs/ngrok-agent/config#config-ngrok-tunnel-definitions).

Instructions to set up ngrok:
- [Install ngrok](https://ngrok.com/download),
- Make sure you are using the latest version of ngrok and not using a previously installed version of ngrok,
- Sign up for a free [ngrok account](https://dashboard.ngrok.com/signup),
- Verify your email address from the email sent by ngrok,
- Retrieve [your Authoken](https://dashboard.ngrok.com/get-started/your-authtoken), 
- Run the command `ngrok config add-authtoken <your-authtoken>`
- Set up both tunnels
	- Run `ngrok config edit`
		- For a free ngrok account, add following lines to the ngrok configuration file (under authoken line):	
			*tunnels:
				six:
					proto: http
					addr: 6000
				eight:
					proto: http
					addr: 8000*
		- For a [paid ngrok account](https://dashboard.ngrok.com/billing/subscription), you may set ngrok hostnames that never change on each ngrok new launch, add following lines to the ngrok configuration file (under authoken line) - set hostnames to actual desired values:
			*tunnels:
				six:
					proto: http
					addr: 6000
					hostname: setanamehere6.ngrok.io
				eight:
					proto: http
					addr: 8000
					hostname: setanamehere8.ngrok.io*
		Note: The Voice API application (this repository) will be running on local port 8000, the sample chatbot will be running on local port 6000
- Start both ngrok tunnels
	- Run `ngrok start six eight`
	- You will see lines like
		....
		Web Interface                 http://127.0.0.1:4040                                      
		*Forwarding                   https://xxxxxxx.ngrok.io -> http://localhost:6000                                     
		Forwarding                    https://yyyyyyy.ngrok.io -> http://localhost:8000* 
	- Make note of *xxxxxxx.ngrok.io* (without the leading https://), as it will be set as **`BOT_SRV`** in the next steps below,
	- Make note of *https://yyyyyyy.ngrok.io* as it will be needed in the next steps below. 		


### Non local deployment

If you are using hosted servers, for example Heroku, your own servers, or some other cloud provider,
you will need the public hostnames and if necessary public ports of the servers that
run the Voice API application (this repository),</br>
and the one that run the simple chatbot,</br>
e.g.	`xxxxxxxx.herokuapp.com`, `myserver1.mycompany.com:32000`</br>
		`yyyyyyyy.herokuapp.com`, `myserver2.mycompany.com:40000`</br>

  (the former will be set as **`BOT_SRV`** in the following steps, no `port` is necessary with heroku as public hostname)

## Set up your Vonage Voice API application credentials and phone number

[Log in to your](https://dashboard.nexmo.com/sign-in) or [sign up for a Vonage API account](https://dashboard.nexmo.com/sign-up).

Go to [Your applications](https://dashboard.nexmo.com/applications), access an existing application or [+ Create a new application](https://dashboard.nexmo.com/applications/new).

Under Capabilities section (click on [Edit] if you do not see this section):

Enable Voice
- Under Answer URL, leave HTTP GET, and enter https://\<host\>:\<port\>/answer (replace \<host\> and \<port\> with the public host name and if necessary public port of the server where this sample application is running)</br>
- Under Event URL, **select** HTTP POST, and enter https://\<host\>:\<port\>/event (replace \<host\> and \<port\> with the public host name and if necessary public port of the server where this sample application is running)</br>
Note: If you are using ngrok for this sample application, the answer URL and event URL look like (muts include leading https://):</br>
https://yyyyyyyy.ngrok.io/answer</br>
https://yyyyyyyy.ngrok.io/event</br> 	
- Click on [Generate public and private key] if you did not yet create or want new ones, then save as .private.key file (note the leading dot in the file name) in this application folder.</br>
**IMPORTANT**: Do not forget to click on [Save changes] at the bottom of the screen if you have created a new key set.</br>
- Link a phone number to this application if none has been linked to the application.

Please take note of your **application ID** and the **linked phone number** (as they are needed in the very next section.)

For the next steps, you will need:</br>
- Your [Vonage API key](https://dashboard.nexmo.com/settings) (as **`API_KEY`**)</br>
- Your [Vonage API secret](https://dashboard.nexmo.com/settings), not signature secret, (as **`API_SECRET`**)</br>
- Your `application ID` (as **`APP_ID`**),</br>
- The **`phone number linked`** to your application (as **`SERVICE_NUMBER`**), your phone will **call that number**,</br>
- The Simple Text-Only chatbot server public hostname and port (as **`BOT_SERVER`**), the argument has no http:// nor https:// prefix, no trailing slash, and no sub-path.</br>

## Overview on how this sample Voice API application works

- This application may receive incoming calls to the **`phone number linked`**, or you may initiate outgoings call with the URL \<this-server\>/makecall (insert the number to call in _callInfo_ field).

- You may customize the inital text sent to your chatbot to correspond to your chatbot programming and use case.

- Chatbot responses will be received by this application.</br>


## Running this sample Voice API application

You may select one of the following 2 types of deployments.

### Local deployment

To run your own instance of this sample application locally, you'll need an up-to-date version of Node.js (we tested with version 16.15.1).

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

Make sure ngrok has been already started with both tunnels as explained in previous section.

Launch the applicatiom:
```bash
node voice-on-text-bot-app-with-simple-bot
```
See also the next section **Testing voice integration with a sample text-only simple chatbot**

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
*Note: In following command, replace "myappname" with a unique name on the whole Heroku platform*

```bash
heroku create myappname
```

On your Heroku dashboard where your application page is shown, click on `Settings` button,
add the following `Config Vars` and set them with their respective values:</br>
API_KEY</br>
API_SECRET</br>
APP_ID</br>
BOT_SERVER</br>
SERVICE_NUMBER</br>
PRIVATE_KEY_FILE with the value ./.private.key</br>

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

### Testing voice integration with a sample text-only simple chatbot 

To simulate the voice interaction with a very simple sample text-only chatbot, you may use the code (from https://github.com/nexmo-se/voice-enabling-text-bot-connecting-ref-vapi-asr)
```bash
node very-simple-bot.js
```
with the client application
```bash 
node voice-on-text-bot-app-with-simple-bot.js
```

### Voice enable your text-only chatbot 

For voice enabling and integrating with your own text chatbot,

you do not need any code from the other repository, you will use and update the source code from this repository:

voice-on-text-bot-app-generic.js 

you may look at voice-on-text-bot-app-with-simple-bot.js as a starting reference for updating voice-on-text-bot-app-generic.js to work with your text-only chatbot.


