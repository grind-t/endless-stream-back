import { getCLI } from 'service/cli'
import { google } from 'googleapis'
import { handleConnection } from 'events/socket'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { App, UserRole } from 'apps/generic'
import { EventList } from 'lib/event-list'
import { MediaShare } from 'lib/media-share'

const port = 8080

const expressApp = express()
const server = createServer(expressApp)
const io = new Server(server)
const app = {
  broadcaster: {
    id: 'admin',
    name: 'admin',
    role: UserRole.Broadcaster,
  },
  eventList: new EventList(3),
  mediaShare: new MediaShare(100, 1, 2),
  chat: {
    say: async (message) => console.log(message),
  },
  io,
} satisfies App
const cli = getCLI(app)

expressApp.get('/twitch/auth', async (req, res) => {
  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID
  const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET
  const oauthURL = 'https://id.twitch.tv/oauth2'
  const redirectURI = `http://localhost:${port}/twitch/auth`
  const code = req.query.code as string
  if (code) {
    const tokenURL = `${oauthURL}/token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectURI}`
    const response = await fetch(tokenURL, { method: 'POST' })
    const data = await response.json()
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

expressApp.get('/youtube/auth', async (req, res) => {
  const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID
  const clientSecret = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET
  const redirectURI = `http://localhost:${port}/youtube/auth`
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectURI
  )
  const code = <string>req.query.code
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

await new Promise((resolve) => server.listen(port, <() => void>resolve))

io.on('connection', (socket) => handleConnection(app, socket))

cli.prompt()

if (import.meta.hot) {
  const dispose = () => server.close()
  import.meta.hot.on('vite:beforeFullReload', dispose)
  import.meta.hot.dispose(dispose)
}
