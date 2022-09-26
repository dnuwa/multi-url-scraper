const { jumia } = require("./modules/jumia");
const { etsy } = require("./modules/etsy");

const { google } = require("googleapis");
const keys = require("./keys.json");

//connect to google spreadsheet
const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

client.authorize(function (err, tokens) {

  //parameters to pass to the googlesheet run {spreadsheetId, sheetName, column}
  const spreadsheet = `1zuJAmH5dbbo5di17Rmi-uIqGmXsZp5p-k1zP7FGYoYI`;
  const sheetName = `Sheet2`;
  const dataRange = `${sheetName}!A2:Z`;
  const newDataRange = 2;
  const newDatacolumn = `e`

  if (err) {
    console.log(err);
    return;
  } else {
    console.log("Connected to api!");
    gsrun(client, spreadsheet, dataRange, newDataRange, sheetName, newDatacolumn);
  }
});

async function gsrun(cl, spreadsheetId, getRange, postRange, sheetName, column) {
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
    prdtUrls.push(row[0]);
  });

  for (let i = 0; i < prdtUrls.length; i++) {
    let domain = new URL(prdtUrls[i]);
    if (domain.hostname === `www.etsy.com`) {
      const etsyPdt = await etsy(prdtUrls[i]);
      console.log([Object.values(etsyPdt)]);

      const updateOpt = {
        spreadsheetId,
        range: `${sheetName}!${column}${postRange++}`,
        valueInputOption: "USER_ENTERED",
        resource: { values: [Object.values(etsyPdt)] },
      };

      let res = await gsapi.spreadsheets.values.update(updateOpt);
      console.log(`status: ${res.status} -update success-`);
    }
    if (domain.hostname === `www.jumia.ug`) {
      const jumiaPdt = await jumia(prdtUrls[i]);
      console.log([Object.values(jumiaPdt)]);

      const updateOpt2 = {
        spreadsheetId,
        range: `${sheetName}!${column}${postRange++}`,
        valueInputOption: "USER_ENTERED",
        resource: { values: [Object.values(jumiaPdt)] },
      };

      let res = await gsapi.spreadsheets.values.update(updateOpt2);
      console.log(`status: ${res.status} -update success-`);
    }
  }
}
