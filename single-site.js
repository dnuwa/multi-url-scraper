const { textContent } = require("domutils");
const puppeteer = require("puppeteer");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

const { google } = require("googleapis");
const keys = require("./keys.json");

//connect to google spreadsheet
const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

client.authorize(function (err, tokens) {
  // let url = "https://www.jumia.ug/electronics/"
  // let url = `https://www.jumia.ug/electronics/?page=2`;
  let spreadsheetId = `1zuJAmH5dbbo5di17Rmi-uIqGmXsZp5p-k1zP7FGYoYI`;
  let range = `Sheet3!A2`;

  if (err) {
    console.log(err);
    return;
  } else {
    console.log("Connected to api!");
    datafunc(spreadsheetId, range);
  }
});

const extractProducts = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto(url);
  console.log(`scraping: ${url}`);

  //scrape the data
  const productsOnPage = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".info")).map((pdt) => ({
      name: pdt.querySelector("h3").innerText.trim(),
      price: pdt.querySelector(".prc").innerText.trim(),
    }))
  );

  await page.close();

  //Recursively scrape the next page
  if (productsOnPage.length < 1) {
    // terminate if no products exist
    return productsOnPage;
  } else {
    //go fetch next page
    //whats on the next URL
    let nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
    const nextUrl = `https://www.jumia.ug/electronics/?page=${nextPageNumber}`;

    return productsOnPage.concat(await extractProducts(nextUrl));
  }
};

const datafunc = async (spreadsheetId, range) => {

  const firstUrl = `https://www.jumia.ug/electronics/?page=1`

  let pdts = await extractProducts(firstUrl);

  console.log(pdts.length)

  // should we end recurssion?
  // if (pdts.length < 1) {
  //   return pdts;
  // } else {
  //   //go fetch next page
  //   //whats on the next URL
  //   let nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
  //   const nextUrl = `https://www.jumia.ug/electronics/?page=${nextPageNumber}`;

  //   pdts.concat(await extractProducts(nextUrl));
  // }

  let output = pdts.map(function (obj) {
    return Object.keys(obj)
      .sort()
      .map(function (key) {
        return obj[key];
      });
  });

  const gsapi = google.sheets({
    version: "v4",
    auth: client,
  });

  const updateOpt2 = {
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    resource: { values: output },
  };

  let res = await gsapi.spreadsheets.values.update(updateOpt2);
  console.log(`status: ${res.status} -update success-`);
  return res;
};
