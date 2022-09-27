const puppeteer = require("puppeteer");

//jumia
const jumia = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(0);
  await page.goto(`${url}`);

  const price = await page.evaluate(() =>
    document.querySelector(".-hr div span") !== null
      ? document.querySelector(".-hr div span").innerText.trim()
      : ""
  );

  let product = {
    // name,
    price: price ? price : `-`,
    error: price ? `-` : `No value`,
  };

  await browser.close();
  return product;
};

module.exports = { jumia };
