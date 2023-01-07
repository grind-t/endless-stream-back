/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TWITCH_CLIENT_ID: string
  readonly VITE_TWITCH_CLIENT_SECRET: string
  readonly VITE_TWITCH_EVENTSUB_SECRET: string
  readonly VITE_YOUTUBE_CLIENT_ID: string
  readonly VITE_YOUTUBE_CLIENT_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
