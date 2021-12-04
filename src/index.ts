import { start } from "./server.js";

const { twitch } = await start();
twitch.chat.say(twitch.channel, "чупапи муняня");
