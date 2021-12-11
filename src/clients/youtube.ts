import { readFileSync } from 'fs'
import { writeFile } from 'fs/promises'
import { google, youtube_v3, Auth } from 'googleapis'

const clientId = process.env.YOUTUBE_CLIENT_ID
const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
const tokenPath = 'data/youtube-token.json'

let oauth2Client: Auth.OAuth2Client | undefined
let apiClient: youtube_v3.Youtube | undefined

function getOauth2Client() {
  if (oauth2Client) return oauth2Client
  const token = JSON.parse(readFileSync(tokenPath, 'utf-8'))
  oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials(token)
  oauth2Client.on('tokens', (newToken) => {
    const json = JSON.stringify(Object.assign(token, newToken), null, 2)
    writeFile(tokenPath, json).catch(console.error)
  })
  return oauth2Client
}

export function getApiClient(): youtube_v3.Youtube {
  if (apiClient) return apiClient
  apiClient = google.youtube({ version: 'v3', auth: getOauth2Client() })
  return apiClient
}
