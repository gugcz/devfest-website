import * as rp from 'request-promise';

export async function informationToDevfestSlack(test:string) {
  const options = {
    method: 'POST',
    uri: 'https://hooks.slack.com/services/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',
    headers: {
        'Content-Type': 'application/json',
    },
    body: {
      text: test
    },
    json: true
  };
  await rp(options);
  return true;
}