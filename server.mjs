import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fetch from "node-fetch";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";
import {
  ClientCredentialsAuthProvider,
  RefreshingAuthProvider,
} from "@twurple/auth";
import { connect } from "ngrok";
import { EventSubMiddleware } from "@twurple/eventsub";
import { ApiClient } from "@twurple/api";
import { ChatClient } from "@twurple/chat";

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 3000;
const url = new URL(await connect(port));

app.get("/twitch/auth", async (req, res) => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const oauthURL = "https://id.twitch.tv/oauth2";
  const redirectURI = `http://localhost:${port}/twitch/auth`;
  const code = req.query.code;
  if (code) {
    const tokenURL = `${oauthURL}/token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectURI}`;
    const response = await fetch(tokenURL, { method: "POST" });
    const data = await response.json();
    const token = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      scope: data.scope,
      expiresIn: 0,
      obtainmentTimestamp: 0,
    };
    res.status(200).json(token);
  } else {
    const authURL = `${oauthURL}/authorize?client_id=${clientId}&redirect_uri=${redirectURI}&response_type=code&scope=chat:read+chat:edit`;
    res.redirect(authURL);
  }
});

function getTwitchClient() {
  const userId = "149690942";
  const userName = "grind_t";
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const token = JSON.parse(readFileSync("./twitch-token.json", "utf-8"));
  const userAuthProvider = new RefreshingAuthProvider(
    {
      clientId,
      clientSecret,
      onRefresh: (token) => {
        const json = JSON.stringify(token, null, 2);
        writeFile("./twitch-token.json", json).catch(console.error);
      },
    },
    token
  );
  const appAuthProvider = new ClientCredentialsAuthProvider(
    clientId,
    clientSecret
  );
  const apiClient = new ApiClient({ authProvider: userAuthProvider });
  const chatClient = new ChatClient({
    authProvider: userAuthProvider,
    channels: [userName],
  });
  const middleware = new EventSubMiddleware({
    apiClient: new ApiClient({ authProvider: appAuthProvider }),
    hostName: url.hostname,
    pathPrefix: "/twitch/events",
    secret: process.env.TWITCH_EVENTSUB_SECRET,
  });
  return {
    channelId: userId,
    channel: userName,
    api: apiClient,
    chat: chatClient,
    events: middleware,
  };
}

async function start() {
  const twitch = getTwitchClient();
  await twitch.chat.connect();
  await twitch.events.apply(app);
  await new Promise((resolve) => server.listen(port, resolve));
  await twitch.events.markAsReady();
  return { twitch };
}

export { start };