const { jumia } = require("./modules/jumia");
const { etsy } = require("./modules/etsy");

const { google } = require("googleapis");
const keys = require("./keys.json");

//connect to google spreadsheet
const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

client.authorize(function (err, tokens) {

  const spreadsheet = `1zuJAmH5dbbo5di17Rmi-uIqGmXsZp5p-k1zP7FGYoYI`;
  const dataRange = `A2:C7`;
  const newDataRange = `A2`;

  if (err) {
    console.log(err);
    return;
  } else {
    console.log("Connected to api!");
    gsrun(client, spreadsheet, dataRange, newDataRange);
  }
});

async function gsrun(cl, spreadsheetId, getRange, postRange) {
  const gsapi = google.sheets({
    version: "v4",
    auth: cl,
  });

  const opt = {
    spreadsheetId,
    range: getRange,
  };

  let data = await gsapi.spreadsheets.values.get(opt);
  let rows = data.data.values;

  //save all the product urls to to the prdUrls variables
  let prdtUrls = [];

  rows.forEach((row) => {
    // Print columns C, which correspond to indice 3.
    prdtUrls.push(row[2]);
  });

  let allProdcutUrls = [];

  for (let i = 0; i < prdtUrls.length; i++) {
    let domain = new URL(prdtUrls[i]);
    if (domain.hostname === `www.etsy.com`) {
      const etsyPdt = await etsy(prdtUrls[i]);
      allProdcutUrls.push({ ...etsyPdt, url: prdtUrls[i] });
    } else if (domain.hostname === `www.jumia.ug`) {
      const jumiaPdt = await jumia(prdtUrls[i]);
      allProdcutUrls.push({ ...jumiaPdt, url: prdtUrls[i] });
    }
  }

  // Converts Array of objects into Array of Arrays
  let output = allProdcutUrls.map(function (obj) {
    return Object.keys(obj)
      .sort()
      .map(function (key) {
        return obj[key];
      });
  });

  //Update object
  const updateOpt = {
    spreadsheetId,
    range: postRange,
    valueInputOption: "USER_ENTERED",
    resource: { values: output },
  };

  //Updates the google spreadsheet
  let res = await gsapi.spreadsheets.values.update(updateOpt);
  console.log(`status: ${res.status} -update success-`);
}