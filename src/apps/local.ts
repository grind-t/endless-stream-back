import 'dotenv/config'
import { env } from 'process'
import { getApp, getIO, startServer } from '../server.js'
import { getCLI } from '../cli.js'
import { google } from 'googleapis'
import { handleConnection } from '../events/socket.js'

env.PLATFORM = 'local'

const app = getApp()
const io = getIO()
const port = 8080
const cli = getCLI()

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

await startServer(port)

io.on('connection', handleConnection)

cli.prompt()
