const fs = require('fs');
const express = require('express');
const cors = require('cors');

const puppeteer = require('puppeteer');

const app = express();
app.use(cors());

const port = process.env.PORT || 3003;

app.get('/image', (req, res) => {
  const { url } = req.query;
  console.log(url);
  const imagePath = `./images/${break_address(url)[1]}.png`;

  if (fs.existsSync(imagePath)) {
    res.status(200).sendFile(imagePath, { root: __dirname });
  } else {
    takeScreenshot(url, imagePath)
      .then(result => res.status(200).sendFile(result, { root: __dirname }))
      .catch(err => {
        res.status(500).json({ error: err });
      });
  }
});

const break_address = url => {
  var result = url.split('://');
  var protocol = result[0];
  result = result[1].split('.com');
  var domain = result[0];
  result = result[1].split('/');

  if (result[1]) {
    return [protocol, domain, result[1]];
  }

  return [protocol, domain];
};

const takeScreenshot = async (url, path) => {
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1440,
      height: 900,
      isLandscape: true,
    },
  });

  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  const screenshot = await page.screenshot({
    path: path,
    encoding: 'binary',
    omitBackground: true,
  });

  await browser.close();

  return path;
};

app.listen(port, () =>
  console.log(`Preview Generator listening on port ${port}!`)
);
