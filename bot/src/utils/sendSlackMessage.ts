import * as https from 'https';

import config from '@bot/src/config';

const slackChannels = {
  errors: config.slackChannelsWebhooks.errors,
  deals: config.slackChannelsWebhooks.deals,
};

// Doing it this way to avoid using 3rd party services
// Verbose but works fine
function sendSlackMessage(message: unknown, type: keyof typeof slackChannels) {
  return new Promise((resolve) => {
    const body = JSON.stringify(message);

    const options = {
      hostname: 'hooks.slack.com',
      port: 443,
      path: slackChannels[type],
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const postReq = https.request(options, (res) => {
      const chunks: unknown[] = [];

      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        return chunks.push(chunk);
      });

      res.on('end', () => {
        resolve({
          body: chunks.join(''),
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
        });
      });

      return res;
    });

    postReq.write(body);
    postReq.end();
  });
}

export function formatErrorToSlackBlock(stringifiedError: string, serverId: string) {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Fuck, something is wrong guys 😳',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Server ID: ${serverId}*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '```' + stringifiedError + '```',
        },
      },
    ],
  };
}

export default sendSlackMessage;
