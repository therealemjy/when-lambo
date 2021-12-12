import axios from 'axios';

import config from '@bot/config';

// Doing it this way to avoid using 3rd party services
// Verbose but works fine
const sendSlackMessage = async (message: unknown) => {
  const body = JSON.stringify(message);
  const res = await axios.post(config.slackChannelsWebhooks.deals, body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res;
  // return new Promise((resolve) => {

  //   const options = {
  //     hostname: 'hooks.slack.com',
  //     port: 443,
  //     path: slackChannels[type],
  //     method: 'POST',
  // headers: {
  //   'Content-Type': 'application/json',
  //   'Content-Length': Buffer.byteLength(body),
  // },
  //   };

  //   const postReq = https.request(options, (res) => {
  //     const chunks: unknown[] = [];

  //     res.setEncoding('utf8');
  //     res.on('data', (chunk) => {
  //       return chunks.push(chunk);
  //     });

  //     res.on('end', () => {
  //       TODO: handle errors
  //       resolve({
  //         body: chunks.join(''),
  //         statusCode: res.statusCode,
  //         statusMessage: res.statusMessage,
  //       });
  //     });

  //     return res;
  //   });

  //   postReq.write(body);
  //   postReq.end();
  // });
};

export default sendSlackMessage;
