import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import fetch from 'node-fetch'
import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import {
  ClientCredentialsAuthProvider,
  RefreshingAuthProvider,
} from '@twurple/auth'
import { connect } from 'ngrok'
import { EventSubMiddleware } from '@twurple/eventsub'
import { ApiClient } from '@twurple/api'
import { ChatClient } from '@twurple/chat'
import { google } from 'googleapis'

const app = express()
const server = createServer(app)
const socket = new Server(server)
const port = 8080
const url = new URL(await connect(port))

app.get('/twitch/auth', async (req, res) => {
  const clientId = process.env.TWITCH_CLIENT_ID as string
  const clientSecret = process.env.TWITCH_CLIENT_SECRET as string
  const oauthURL = 'https://id.twitch.tv/oauth2'
  const redirectURI = `http://localhost:${port}/twitch/auth`
  const code = req.query.code as string
  if (code) {
    const tokenURL = `${oauthURL}/token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectURI}`
    const response = await fetch(tokenURL, { method: 'POST' })
    const data: any = await response.json()
    const token = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      scope: data.scope,
      expiresIn: 0,
      obtainmentTimestamp: 0,
    }
    res.status(200).json(token)
  } else {
    const authURL = `${oauthURL}/authorize?client_id=${clientId}&redirect_uri=${redirectURI}&response_type=code&scope=chat:read+chat:edit`
    res.redirect(authURL)
  }
})

app.get('/youtube/auth', async (req, res) => {
  const clientId = process.env.YOUTUBE_CLIENT_ID as string
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET as string
  const redirectURI = `http://localhost:${port}/youtube/auth`
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectURI
  )
  const code = req.query.code as string
  if (code) {
    const { tokens } = await oauth2Client.getToken(code)
    res.status(200).json(tokens)
  } else {
    const authURL = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl',
      ],
    })
    res.redirect(authURL)
  }
})

function getTwitchClient() {
  const userId = '149690942'
  const userName = 'grind_t'
  const clientId = process.env.TWITCH_CLIENT_ID as string
  const clientSecret = process.env.TWITCH_CLIENT_SECRET as string
  const token = JSON.parse(readFileSync('data/twitch-token.json', 'utf-8'))
  const userAuthProvider = new RefreshingAuthProvider(
    {
      clientId,
      clientSecret,
      onRefresh: (token) => {
        const json = JSON.stringify(token, null, 2)
        writeFile('data/twitch-token.json', json).catch(console.error)
      },
    },
    token
  )
  const appAuthProvider = new ClientCredentialsAuthProvider(
    clientId,
    clientSecret
  )
  const apiClient = new ApiClient({ authProvider: userAuthProvider })
  const chatClient = new ChatClient({
    authProvider: userAuthProvider,
    channels: [userName],
  })
  const middleware = new EventSubMiddleware({
    apiClient: new ApiClient({ authProvider: appAuthProvider }),
    hostName: url.hostname,
    pathPrefix: '/twitch/events',
    secret: process.env.TWITCH_EVENTSUB_SECRET as string,
  })
  return {
    channelId: userId,
    channel: userName,
    api: apiClient,
    chat: chatClient,
    events: middleware,
  }
}

function getYoutubeClient() {
  const clientId = process.env.YOUTUBE_CLIENT_ID
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
  const redirectURI = `http://localhost:${port}/youtube/auth`
  const token = JSON.parse(readFileSync('data/youtube-token.json', 'utf-8'))
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectURI
  )
  oauth2Client.setCredentials(token)
  oauth2Client.on('tokens', (token) => {
    const json = JSON.stringify(token, null, 2)
    writeFile('data/youtube-token.json', json).catch(console.error)
  })
  return google.youtube({ version: 'v3', auth: oauth2Client })
}

async function start() {
  const twitch = getTwitchClient()
  const youtube = getYoutubeClient()
  await twitch.chat.connect()
  await twitch.events.apply(app)
  // @ts-ignore
  await new Promise((resolve) => server.listen(port, resolve))
  await twitch.events.markAsReady()
  return { twitch, youtube }
}

export { start, socket }
