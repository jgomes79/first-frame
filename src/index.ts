import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { html } from 'hono/html';
import type { FrameSignaturePacket } from './types';

const app = new Hono();

const data = [{
  name: 'Moneyland',
  image: 'https://smartrightsnfts.s3.eu-west-3.amazonaws.com/3a2b3338-6b77-4708-8e0b-2f4b486fa637.jpg',
  url: 'https://alpha.givitnft.com/collection/moneyland'
}, {
  name: 'SuperPioneros',
  image: 'https://smartrightsnfts.s3.eu-west-3.amazonaws.com/ea4ad5cc-53fb-4994-b048-fbe60a544d2f.png',
  url: 'https://alpha.givitnft.com/collection/superpioneros'
}, {
  name: 'gggggggggggg',
  image: 'https://smartrightsnfts.s3.eu-west-3.amazonaws.com/e9233941-8566-42b8-988d-d924f060c4c4.jpg',
  url: 'https://alpha.givitnft.com/collection/gggggggggggg'
}, {
  name: 'javierdelahozm',
  image: 'https://smartrightsnfts.s3.eu-west-3.amazonaws.com/98f9597c-a945-47c9-bb34-2fda2719ac9a.png',
  url: 'https://alpha.givitnft.com/collection/javierdelahozm'
}];

const getInitialHTML = (framePostUrl: string) => {
  return html`
    <html lang="en">
      <head>
        <meta property="og:image" content="https://smartrightsnfts.s3.eu-west-3.amazonaws.com/GivitNFT.png" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:post_url" content="${framePostUrl}" />
        <meta property="fc:frame:image" content="https://smartrightsnfts.s3.eu-west-3.amazonaws.com/GivitNFT.png" />
        <meta property="fc:frame:button:1" content="View communities" />
        <title>GivitNFT Communities</title>
      </head>
      <body>
        <h1>GivitNFT. Visit us in <a href="https://givitnft.com">https://givitnft.com</a></h1>
      </body>
    </html>
  `;
}

app.get('/', (c) => {
  const framePostUrl = c.req.url.replace('http://', 'https://') + '0';
  return c.html(getInitialHTML(framePostUrl));
});

app.post('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));

    if (id >= data.length) {
      const framePostUrl = c.req.url.replace('http://', 'https://').slice(0, c.req.url.lastIndexOf('/') + 1) + "/0";
      return c.html(getInitialHTML(framePostUrl));
    }

    const dataId = id + 1;
    console.log('dataId', dataId);

    const framePostUrl = c.req.url.replace('http://', 'https://').slice(0, c.req.url.lastIndexOf('/') + 1) + "/" + dataId.toString();
    console.log(framePostUrl);

    return c.html(html`
      <html lang="en">
        <head>
          <meta property="og:image" content="${data[dataId-1].image}" />
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:post_url" content="${framePostUrl}" />
          <meta property="fc:frame:image" content="${data[dataId-1].image}" />
          <meta property="fc:frame:button:1" content="Go to ${data[dataId-1].name} page" />
          <meta property="fc:frame:button:1:action" content="link" />
          <meta property="fc:frame:button:1:target" content="${data[dataId-1].url}" />
          <meta property="fc:frame:button:2" content="Next" />
          <title>GivitNFT Communities</title>
        </head>
        <body>
          <h1>GivitNFT. Visit us in <a href="https://givitnft.com">https://givitnft.com</a></h1>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Invalid request' }, 400)
  }
})

app.post('/', async (c) => {
  try {
    console.log('entro en el post');
    const body = await c.req.json<FrameSignaturePacket>();
    console.log(body);

    const framePostUrl = c.req.url;
    console.log(framePostUrl);
  // <meta property="fc:frame:post_url" content="${framePostUrl}" />

    const { buttonIndex } = body.untrustedData;

    return c.html(html`
      <html lang="en">
        <head>
          <meta property="og:image" content="${data[buttonIndex-1].image}" />
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${data[buttonIndex-1].image}" />
          <meta property="fc:frame:button:1" content="Go to ${data[buttonIndex-1].url}" />
          <meta property="fc:frame:button:1:action" content="link" />
          <meta property="fc:frame:button:1:target" content="${data[buttonIndex-1].url}" />
          ${buttonIndex > 1 ? `<meta property="fc:frame:button:${buttonIndex-1}" content="Previous" />` : ''}
          ${buttonIndex < data.length ? `<meta property="fc:frame:button:${buttonIndex+1}" content="Next" />` : ''}
          <title>GivitNFT Communities</title>
        </head>
        <body>
          <h1>GivitNFT. Visit us in <a href="https://givitnft.com">https://givitnft.com</a></h1>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Invalid request' }, 400)
  }
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
