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
const user = await apiClient.users.getMe();
const chatClient = new ChatClient({
  authProvider: userAuthProvider,
  channels: [user.name],
});
await chatClient.connect();
const middleware = new EventSubMiddleware({
  apiClient: new ApiClient({ authProvider: appAuthProvider }),
  hostName: url.hostname,
  pathPrefix: "/twitch/events",
  secret: process.env.TWITCH_EVENTSUB_SECRET,
});
await middleware.apply(app);

app.get("/twitch/auth", async (req, res) => {
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

function onMessage(channel, user, message) {
  switch (message) {
    case "!плейлист+":
      chatClient.say(channel, "муняня");
      break;
  }
}

server.listen(port, async () => {
  chatClient.onMessage(onMessage);
  await middleware.markAsReady();
  console.log(`App listening at http://localhost:${port}`);
});
