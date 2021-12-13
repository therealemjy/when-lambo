import axios from 'axios';

import config from '@bot/config';

const sendSlackMessage = async (message: unknown) => {
  const body = JSON.stringify(message);

  return axios.post(config.slackChannelsWebhooks.deals, body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export default sendSlackMessage;
