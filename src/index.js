import { Client } from 'discord.js';

import router from './routes';
import { logInfo, catcher } from './utils/logger';
import spotify from './controllers/spotify';

const client = new Client();

router.use(async (state, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  logInfo(`${state.url} - ${ms}ms`);
});

client.on('ready', () => {
  const botId = client.user.id;
  logInfo(`Logged in as ${client.user.tag}!`);

  client.user.setActivity('$help', {
    type: 'PLAYING'
  });

  client.on('message', msg => {
    if (botId === msg.member.id) {
      return;
    }
    let args = msg.content.split(' ');
    const url = args[0];
    args.splice(0, 1);

    if (msg.content.indexOf('https://open.spotify.com') !== -1) {
      return spotify(msg.content, msg).catch(catcher);
    }
    if (url.slice(0, 1) !== '$') {
      return;
    }

    router.route(url, {
      url,
      msg,
      args,
      client
    });
  });
});

client.login(process.env.DISCORD_BOT_TOKEN);
