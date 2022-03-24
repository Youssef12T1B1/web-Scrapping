const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const connectDB = require("./config/db");
const Product = require("./models/products");
connectDB();
const app = express();
puppeteer.use(StealthPlugin());
const PORT = require("./config/.env").PORT || 5000;

(async (event) => {
  const link = "https://www.mediamarkt.es";

  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1199, height: 900 });

    await page.goto(link, { waitUntil: "domcontentloaded" });

    await page.waitForSelector("#pwa-consent-layer-accept-all-button");
    await page.click("#pwa-consent-layer-accept-all-button");
    await page.waitFor(1000);
    await page.click(".bRkwoU button");

    // All Catrgories from the navbar of the homepage
    const Categories = await page.$$eval(".fCIBKX", (e) =>
      e.slice(0, 5).map((a) => {
        return {
          title: a.innerText,
          url: a.href,
        };
      })
    );
    // console.log(Categories);

    // working with 1 Subcategory
    await page.goto(Categories[1].url);
    await page.click(".bJwUkd");
    const Subcategory = await page.$$eval(".bOaaXv", (e) =>
      e.slice(0, 9).map((a) => {
        return {
          title: a.innerText,
          url: a.href,
        };
      })
    );
    // console.log(Cat[1]);

    // working with 3 subs of the Subcategory
    await page.goto(Subcategory[0].url);
    const subofsub = await page.$$eval(".eFdtKw", (e) =>
      e.slice(4, 7).map((a) => {
        return {
          title: a.innerText,
          url: a.href,
        };
      })
    );
    // console.log(CatCat);

    // collecting data from the 3 Subcategory
    for (k = 0; k < 3; ++k) {
      await page.goto(subofsub[k].url);
      await autoScroll(page);

      const title = await page.$$eval(".doYUxh", (e) =>
        e.slice(0, 2).map((a) => a.innerText.split(",")[0])
      );

      // console.log(title);

      //the products specifications
      const specs = await page.$$eval(".hAlAEv", (e) =>
        e.slice(0, 2).map((a) => {
          return {
            specs: a.innerText.split("\n"),
          };
        })
      );
      // console.log(specs);

      // Convert Array to Object
      const speec = [];
      let key = null;
      let obj = {};
      for (i = 0; i < specs.length; i++) {
        for (j = 0; j < specs[i].specs.length; j = j + 2) {
          key = specs[i].specs[j];

          obj[key] = specs[i].specs[j + 1];
        }
        speec.push(obj);
        obj = {};
      }

      // console.log(speec);

      //products Urls
      const url = await page.$$eval(".dRrAGE", (e) =>
        e.splice(0, 2).map((a) => a.href)
      );
      // console.log(url);

      //products images
      const img = await page.$$eval(".gFoXlk picture img", (e) =>
        e.splice(0, 2).map((a) => a.src)
      );

      //more Info about the products
      const info = await page.$$eval(".erxCC", (e) =>
        e.splice(0, 2).map((a) => {
          return {
            infos: a.innerText.split("\n"),
          };
        })
      );

      // const d1 = info[0].

      //Showing  data in Table
      const titleTest = [];
      for (p = 0; p < title.length; ++p) {
        // titleTest.push({
        //   title: title[p],
        //   link: url[p],
        //   Delivery: info[p].infos[0],
        //   price: info[p].infos[info[p].infos.length - 2],
        //   shipping: info[p].infos[info[p].infos.length - 1],
        //   imglink: img[p],
        //   specs: speec[p],
        // });
        // console.log(titleTest);
        // save data to the database (Mongodb)
        const product = await new Product({
          title: title[p],
          url: url[p],
          image: img[p],
          Delivery: info[p].infos[0],
          shipping: info[p].infos[info[p].infos.length - 1],
          price: +info[p].infos[info[p].infos.length - 2],
          specs: speec[p],
        });
        product
          .save()
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      }

      console.log("*************************************");
    }

    await page.screenshot({
      fullPage: true,
      path: "new_image.png",
    });

    await page.close();
    await browser.close();
  } catch (error) {
    console.log(error);
    await browser.close();
  }
})();

//Scroll down to collect Product images
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
app.listen(PORT, () => {
  console.log("server is running on 5000");
});
