import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import { google, youtube_v3, Auth } from 'googleapis'

const clientId = process.env.YOUTUBE_CLIENT_ID
const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
const tokenPath = 'data/youtube-token.json'

let oauth2: Auth.OAuth2Client | undefined
let api: youtube_v3.Youtube | undefined

function getOauth2() {
  if (oauth2) return oauth2
  const token = JSON.parse(readFileSync(tokenPath, 'utf-8'))
  oauth2 = new google.auth.OAuth2(clientId, clientSecret)
  oauth2.setCredentials(token)
  oauth2.on('tokens', (newToken) => {
    const json = JSON.stringify(Object.assign(token, newToken), null, 2)
    writeFile(tokenPath, json).catch(console.error)
  })
  return oauth2
}

export function getYoutubeApi(): youtube_v3.Youtube {
  if (api) return api
  api = google.youtube({ version: 'v3', auth: getOauth2() })
  return api
}
