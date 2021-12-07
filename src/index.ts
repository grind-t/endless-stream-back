import { start, socket } from "./server.js";
import { createInterface } from "readline";

interface MediaRequest {
  user: string;
  videoId: string;
}

interface Media {
  queue: MediaRequest[];
  maxQueue: number;
  current: MediaRequest | undefined;
}

const media: Media = {
  queue: [],
  maxQueue: 100,
  current: undefined,
};

const { twitch, youtube } = await start();
twitch.chat.say(twitch.channel, "чупапи муняня");

async function handleMessage(
  user: string,
  message: string,
  say: (message: string) => Promise<void>
) {
  if (message[0] != "!") return;
  const [command, arg] = message.split(" ", 2);
  switch (command) {
    case "!плейлист+": {
      if (media.queue.length >= media.maxQueue) {
        const errorMessage = `@${user}, плейлист переполнен 🤕`;
        say(errorMessage);
        return;
      }
      const videoId = arg.match(/(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/i)?.at(3);
      if (!videoId) {
        const errorMessage = `@${user}, непонятная ссылка 🤕`;
        say(errorMessage);
        return;
      }
      const video = await youtube.videos
        .list({ id: [videoId], part: ["snippet", "statistics"] })
        .then((r) => r.data.items?.at(0))
        .catch(console.error);
      if (!video) {
        const errorMessage = `@${user}, видео не найдено 🤕`;
        say(errorMessage);
        return;
      }
      media.queue.push({ user, videoId });
      if (!media.current) media.current = media.queue.shift();
      const successMessage = `@${user} добавил в плейлист "${video.snippet?.title}"`;
      say(successMessage);
      break;
    }
  }
}

twitch.chat.onMessage((channel, user, message) =>
  handleMessage(user, message, (message) => twitch.chat.say(channel, message))
);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", async (line) => {
  const match = line.trim().match(/(\S+)\s*(.*)/);
  if (!match) return;
  const command = match[1];
  const args = match[2];
  switch (command) {
    case "event.message": {
      const message = args;
      await handleMessage("admin", message, (response) =>
        Promise.resolve(console.log(response))
      );
      break;
    }
  }
  rl.prompt();
});

rl.prompt();
