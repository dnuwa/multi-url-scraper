const puppeteer = require("puppeteer");
const fs = require("fs");
const json2csv = require("json2csv").Parser;

// www.etsy.com
const etsy = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(0);
  await page.goto(`${url}`);

  const name = await page.evaluate(() =>
    document.querySelector(".wt-mb-xs-2 h1").innerText.trim()
  );

  const price = await page.evaluate(() =>
    document.querySelector(".wt-mb-xs-3 .wt-display-flex-xs p").innerText.trim()
  );

  let product = {
    name,
    price,
  };

  await browser.close();
  return product;
};

//jumia
const jumia = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(0);
  await page.goto(`${url}`);

  const name = await page.evaluate(() =>
    document.querySelector(".-fs0 h1").innerText.trim()
  );

  const price = await page.evaluate(() =>
    document.querySelector(".-hr div span").innerText.trim()
  );

  let product = {
    name,
    price,
  };

  await browser.close();
  return product;
};

//function that will run all
(async () => {
  let all = [];

  const urls = [
    "https://www.etsy.com/listing/1247939316/2000ml-sports-water-bottle-portable?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=Large+capacity+sports+water+bottle&ref=sc_gallery-1-6&pro=1&plkey=7c7cbf7b8d63e1d4dd13409af20c1b20a6414c20%3A1247939316",
    "https://www.etsy.com/listing/526756239/ms-frizzle-womens-dress-magic-school-bus?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=&ref=sr_gallery-1-2&bes=1",
    "https://www.jumia.ug/redmi-9a-6.53-4gb-ram-64gb-rom-13mp-5000mah-green-27216227.html",
    "https://www.jumia.ug/3-in-1-soft-material-anti-theft-backpack-maroon-generic-mpg89495.html",
  ];

  for (let i = 0; i < urls.length; i++) {
    let domain = new URL(urls[i]);
    if (domain.hostname === `www.etsy.com`) {
      const etsyPdt = await etsy(urls[i]);
      all.push({...etsyPdt, url: urls[i]});
    } else if (domain.hostname === `www.jumia.ug`) {
      const jumiaPdt = await jumia(urls[i]);
      all.push({...jumiaPdt, url: urls[i]})
    }
  }
  
  const j2cp = new json2csv();
  const csv = j2cp.parse(all);

  fs.writeFileSync("./etsy.csv", csv, "utf-8");
})();
