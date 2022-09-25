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

    let url = "https://www.kikuu.ug/sale/picks/7012-Electronics.html"
    let spreadsheetId= `1zuJAmH5dbbo5di17Rmi-uIqGmXsZp5p-k1zP7FGYoYI`
    let range= `Sheet3!A2`

  if (err) {
    console.log(err);
    return;
  } else {
    console.log("Connected to api!");
    datafunc(url, spreadsheetId, range);
  }
});

const datafunc = async (url, spreadsheetId, range ) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto(url);

  const products = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".product")).map((pdt) => ({
      name: pdt.querySelector(".product-name").innerText.trim(),
      price: pdt.querySelector(".product p").innerText.trim(),
    }))
  );

  await page.close()

  let output = products.map(function (obj) {
    return Object.keys(obj)
      .sort()
      .map(function (key) {
        return obj[key];
      });
  });

  //   console.log(output);

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
