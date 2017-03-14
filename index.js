const express = require('express');
const bodyparser = require('body-parser');
const marked = require('marked');
const webshot = require('webshot');
const crypto = require('crypto');
const phantom = require('phantom-render-stream');
const fs = require('fs');
const stream = require('stream');

const render = phantom({
  width: '1000',
  height: '500',
});

const app = express();

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

app.use(bodyparser.json());

const x = y => `<html>
  <head>
    <style>
      body { background: white; width: 1000px; word-wrap: break-word; }
    </style>
  </head>
  <body>
    ${y}
  </body>
</html>`;

app.post('/tweets', (req, res, next) => {
  const { type, message } = req.body;

  if (type === 'markdown' || message.length > 140) {
    var s = new stream.Readable();
    s.push(x(marked(message)));
    s.push(null);

    const filename = crypto.createHash('md5').update(message).digest('hex') + '.png';
    const writeStream = fs.createWriteStream(filename);

    writeStream.on('close', () => res.send());

    return s.pipe(render()).pipe(writeStream);
  }

  return res.send(message);
});

app.listen(process.env.PORT || 3000, (err) => {
  if (err) {
    console.error(err);
    process.exit(-1);
  }

  console.log('listening');
});