import * as https from 'https';

// Doing it this way to avoid using 3rd party services
// Verbose but works fine
function sendSlackMessage(message: any) {
  return new Promise((resolve) => {
    const body = JSON.stringify(message);

    const options = {
      hostname: 'hooks.slack.com',
      port: 443,
      path: process.env.SLACK_HOOK_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const postReq = https.request(options, (res) => {
      const chunks: any[] = [];

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

export default sendSlackMessage;
