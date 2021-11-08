# Youtube Spam Purge almost ChromeExtension
An Open-Source Not published Chrome extension to delete all of a user's comment from a video

## Inspiration

I was inspired by this [video](https://www.youtube.com/watch?v=-vOakOgYLUI&t=776s&ab_channel=ThioJoe) and thought I would give it a try on my own terms.

## Disclaimer

I have no idea about JavaScript or Web Development or Chrome Extension Development. If you are looking for nice JS code you can learn from, this is not it chief.

However it might give you a starting point to implement it better.

## Setup

### Create Console project

Just like in the video described you will need to create your own google project.

- Navigate to https://console.cloud.google.com/ and create a new project.
- Next Go to APIs & Services / Library
- Search "youtube" and select "YouTube Data API v3"
- Enable this api

### Now we will create the authentication:
- Next Go to APIs & Services / Credentials
- Create a new Auth 2.0 Client IDs
- Select Web application
- Name it whatever you like
- Add under "Authorized JavaScript origins" the following: "https://www.youtube.com"
- Add under "Authorized redirect URIs" the following: "https://youtube.com/deleteallcomments"
- Save the Credential and get it's client id.
- Create a file names `clientid.js` which looks like this:

```javascript
var google_login_client_id="YOUR-CLIENT-ID-HERE"
```

### Now we will setup the OAuth Screen
- Next go to APIs & Services / OAuth consent screen
- Move your application into Testing status
- Select Edit App
- Add your e-mail address as support
- As authorized domains add "youtube.com"
- On the next page add "/auth/youtube.force-ssl" as a requested Scope.
- On the next page add your google account as test user
- Next on summary

### Now All we need is to install the chrome extension:
- Go to chrome://extensions
- Select Load Unpacked
- Navigate to where you copied the code

Now you should be ready to use this extension

## Usage

You should notice on a new tab watching a video a "DELETE ALL COMMENTS" Text is shown next to the REPLY button.

- Clicking this will navigate you to a new page to login with you google account
- If authenticated, or already authenticated before this should open a new page
- On this page you should see a link to your video and the user, who's comments you plan to delete
- It will search through the video comments and find this user comments
- Once that is finished you shall see two options, show a sample (to make sure you selected the right guy) and to delete all
- Once delete all is clicked it will try to delete all of the comments of that user

## Why not publishing

I don't want to go through the hassle of verification for my first Chrome Extension Exploration project. This was done just for fun from my end.

If you wish to expand on the idea, the code or publish this extension or a really similar to this, kudos to you.

## Article

I've written an article about how this project was created, feel free to check out if you are interested [here](https://fnives.medium.com/inspired-youtube-spam-purge-almost-chrome-extension-c1b760fa8415).
