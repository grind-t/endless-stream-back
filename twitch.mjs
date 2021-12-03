import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fetch from "node-fetch";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";
import { RefreshingAuthProvider } from "@twurple/auth";

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 3000;

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const token = JSON.parse(readFileSync("./twitch-token.json", "utf-8"));
const authProvider = new RefreshingAuthProvider(
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

app.get("/twitch/auth", async (req, res) => {
  const oauthURL = "https://id.twitch.tv/oauth2";
  const redirectURI = `http://localhost:${port}/twitch/auth`;
  const code = req.query.code;
  if (code) {
    const tokenURL = `${oauthURL}/token?client_id=${twitchClientId}&client_secret=${twitchClientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectURI}`;
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
    const authURL = `${oauthURL}/authorize?client_id=${twitchClientId}&redirect_uri=${redirectURI}&response_type=code&scope=chat:read+chat:edit`;
    res.redirect(authURL);
  }
});

server.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
