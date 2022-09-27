const { google } = require("googleapis");
const keys = require("./keys.json");

//connect to google spreadsheet
const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

const main = (sheetId, sheetName, dataColumn, newDatacolumn, errorColumn) => {
  client.authorize(function (err, tokens) {
    //parameters to pass to the googlesheet run {spreadsheetId, sheetName, data-column, new-data-column}
    const dataRange = `${sheetName}!${dataColumn}2:${dataColumn}`;
    const newDataRange = 2;
    const errorRange = 2;

    if (err) {
      console.log(err);
      return;
    } else {
      console.log("Connected to api!");
      gsrun(
        client,
        sheetId,
        dataColumn,
        dataRange,
        newDataRange,
        errorRange,
        sheetName,
        newDatacolumn,
        errorColumn
      );
    }
  });
};

async function gsrun(
  cl,
  spreadsheetId,
  urlColumn,
  getRange,
  postRange,
  eRange,
  sheetName,
  column,
  errColumn
) {
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
  let prdtUrls = rows.flat();

  const parserMap = {
    "www.etsy.com": require("./modules/etsy").etsy,
    "www.jumia.ug": require("./modules/jumia").jumia,
  };

  for (let i = 0; i < prdtUrls.length; i++) {
    let domain = new URL(prdtUrls[i]);

    const parserFunc = parserMap[domain.host];

    const productPriceObj =
      parserFunc !== undefined
        ? await parserFunc(prdtUrls[i])
        : { price: "", error: `Domain not define` };

    let data = [
      {
        range: `${sheetName}!${column}${postRange++}:${column}`, // Update a column
        values: [[productPriceObj.price]],
      },
      {
        range: `${sheetName}!${errColumn}${eRange++}:${errColumn}`, // Update a column
        values: [[productPriceObj.error]],
      },
    ];

    let resource = {
      spreadsheetId: spreadsheetId,
      resource: { data: data, valueInputOption: "USER_ENTERED" },
    };

    let res = await gsapi.spreadsheets.values.batchUpdate(resource);
    console.log(`status: ${res.status} -update success-`);
  }
}

// {spreadsheetId, sheetName, url-column, new-data-column, error-column}
main(`1zuJAmH5dbbo5di17Rmi-uIqGmXsZp5p-k1zP7FGYoYI`, `Sheet2`, `A`, `D`, `E`);
