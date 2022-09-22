const puppeteer = require("puppeteer");


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

module.exports = { jumia };
