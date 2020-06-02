import spotifyAPI from 'spotify-web-api-node';
import youtubeAPI from 'youtube-node';
import { promisify } from 'util';
import { logDebug, logInfo } from '../utils/logger';

const sAPI = new spotifyAPI({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});
const yAPI = new youtubeAPI();

const ytSearch = promisify(yAPI.search).bind(yAPI);
const getToken = () => {
  if (process.env.SPOTIFY_DEV_TOKEN) {
    return sAPI.setAccessToken(process.env.SPOTIFY_DEV_TOKEN);
  }

  sAPI.clientCredentialsGrant().then(
    data => {
      console.log('The access token expires in ' + data.body['expires_in']);
      logDebug(data.body['access_token']);

      sAPI.setAccessToken(data.body['access_token']);
      setTimeout(() => getToken(), (data.body['expires_in'] - 20) * 1000);
    },
    err => {
      console.log('Something went wrong when retrieving an access token', err);
      process.exit(1);
    }
  );
};
getToken();
yAPI.setKey(process.env.YT_API_KEY);

const spotify = async (text, msg) => {
  const regex = /https:\/\/open\.spotify\.com\/(?<type>track|album)\/(?<id>[a-zA-Z0-9]+)/gim;
  const regexResult = regex.exec(text);
  logDebug(text, regexResult);
  const id = regexResult?.groups?.id;
  const type = regexResult?.groups?.type;
  if (!id || !type) return;

  let searchText = '';
  if (type === 'track') {
    const { body } = await sAPI.getTrack(id);
    logDebug(body);
    searchText = `${body.name} ${body.album.name} ${body.artists[0].name}`;
  } else if (type === 'album') {
    const { body } = await sAPI.getAlbum(id);
    logDebug(body);
    searchText = `${body.name} ${body.artists[0].name}`;
  }
  logDebug(searchText);

  const result = await ytSearch(searchText, 1);
  const data = result.items[0];
  if (!data) {
    return msg.reply('🚨 Not Found');
  }
  logDebug(data);

  let url;
  switch (data.id.kind) {
    case 'youtube#video':
      url = `https://youtu.be/${data.id.videoId}`;
      break;
    case 'youtube#playlist':
      url = `https://www.youtube.com/playlist?list=${data.id.playlistId}`;
      break;
    default:
      return msg.reply('🚨 Not Found');
  }

  msg.channel.send([`Maybe... **${data.snippet.title}**?`, url]);
  logInfo('Spotify Link - Success');
};

export default spotify;
