# Music grouper

This project was born out of pure lazyness. 

I'm part of a whatsapp group for sharing music. Usually they are links to spotify, soundcloud, bandcamp, or youtube. Being a lazy and greedy bastard, I wanted to have access to all that music but without doing all the hard work.

This project is a serverless application which listens for new messages in a whatsapp group, and whenever a link is shared, it tries to find that album/track on Spotify and add it to a playlist.


### Components
There's three main components:

- Login: accessing spotify and whatsapp require authenticating as a user. This component sends you an oauth url for Spotify or a QR code for whatsapp. Once you authenticate, it stores the credentials in AWS Parameter Store as an encrypted string.
- Fetch messages cron: A cron job that runs once an hour (or however often you want) and checks for new messages in whatsapp. If it finds any links, it writes them to a DynamoDB table
- Process new record: Subscribes to the DynamoDB stream and for every record added, tries to find that track and add it to the Spotify playlist.

### Setup

Assumes some familiarity with the [serverless framwork](https://www.serverless.com/)

You need:
- A [Spotify app](https://developer.spotify.com/dashboard/applications)
- The Spotify playlist ID where
- The whatsapp group id you want to monitor (more info later on how to get that)
- An email address where you will receive the oauth url and QR code for logging in

Steps:
- Clone this repo and run `npm i` to install dependencies
- Run `mv config.example.json config.json` and fill in the placeholder info. 
- Run `sls deploy` to deploy the application for the first time.
- Take the endpoint url from the output and set it as your redirectUri (both in config.json and in the spotify dashboard of your app). it should look something like this: https://abcdefghijk.execute-api.eu-west-1.amazonaws.com/dev/v1/oauth/spotify
- Run `sls invoke -f loginToServices -d '{"serviceNames":["spotify","whatsapp"]}'`. Note: if you're using gmail, you may need to use 'Show original' to scan the QR code

That's it!

### Architecture
-- coming soon ---
