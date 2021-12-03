import { start } from "./server.mjs";

const { twitch } = await start();
twitch.chat.say(twitch.channel, "чупапи муняня");
