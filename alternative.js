/* main.js */
const express = require('express');
const app = express();

const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;

const port = process.env.PORT || 3003;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SERCET,
});

// Create an express route
app.get('/upload', (req, res) => {
  const { url } = req.query;
  takeScreenshot(url)
    .then(screenshot => {
      uploadScreenshot(screenshot);
    })
    .then(result => res.status(200).json(result));
});

const takeScreenshot = async embedUrl => {
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1440,
      height: 900,
      isLandscape: true,
    },
  });

  const page = await browser.newPage();

  await page.goto(embedUrl, { waitUntil: 'networkidle2' });

  const screenshot = await page.screenshot({
    omitBackground: true,
    encoding: 'binary',
  });

  await browser.close();

  return screenshot;
};

const uploadScreenshot = screenshot => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {};
    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(screenshot);
  });
};

app.listen(port, () =>
  console.log(`Preview Generator listening on port ${port}!`)
);
