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

#### Login
For the moment you only need to login to two services, whatsapp and spotify. We use SNS to email you the 'login challenges' (that's not the right term). For spotify it's an oauth url. When you login using that url, we receive a callback on our webhook with credentials. Those are stored in AWS's Parameter Store and refreshed automatically as needed. For whatsapp it's a QR code which you need to scan with your phone. The connection to whatsapp needs to stay open until the user scans the QR code, so we have an extra long timeout on this lambda function. Once scanned, we store the credentials in the same way.

#### Fetching messages
We read messages from whatsapp chronologically in groups of 25. Each time read, we store the last message in dynamodb as a pagination cursor so that next time we can start from there. For each group, we parse the messages looking for any kind of url and if found, we write them to dynamodb, one record for each url. We also save the source message as metadata because why not.

#### Processing new records
We use dynamodb streams as a message queue. For each record take the following steps:
- look at the url to host to determine the source. If it's something we don't recognize (not spotify, bandcamp, etc..) then ignore it.
- if the url is from spotify, we add it directly to the playlist. (right now it only handles links to albums and tracks. If it's an album, we add all the tracks)
- if the url is from another service, we try to parse the artist and title using a scraper for that service.
- We then search spotify for that artist and title and add the first track result to our playlist.

These last two steps are tricky and error prone. The scrapers aren't 100% reliable and dont always extract good info. The tracks aren't always available on spotify or if the titles don't match exactly, they aren't found. So this algorithm needs some work still. Also, it only handles tracks from other services, but what if someone shares a bandcamp album? should it add the entire thing? I dont know...
