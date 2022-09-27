const puppeteer = require("puppeteer");

// www.etsy.com
const etsy = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(0);
  await page.goto(`${url}`);

  const price = await page.evaluate(() =>
    document.querySelector(".wt-mb-xs-3 .wt-display-flex-xs p") !== null
      ? document
          .querySelector(".wt-mb-xs-3 .wt-display-flex-xs p")
          .innerText.trim()
      : ""
  );

  let product = {
    // name,
    price: price ? price : '-',
    error: price ? `-` : `No value`
  };

  await browser.close();
  return product;
};

module.exports = { etsy };
