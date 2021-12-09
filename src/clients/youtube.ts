import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import { google } from 'googleapis'

const clientId = process.env.YOUTUBE_CLIENT_ID
const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
const token = JSON.parse(readFileSync('data/youtube-token.json', 'utf-8'))
const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
oauth2Client.setCredentials(token)
oauth2Client.on('tokens', (token) => {
  const json = JSON.stringify(token, null, 2)
  console.log(`PREV TOKEN: ${JSON.stringify(token)}`)
  console.log(`NEW TOKEN: ${json}`)
  writeFile('data/youtube-token.json', json).catch(console.error)
})
const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

export default youtube
