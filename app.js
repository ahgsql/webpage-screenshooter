const express = require("express"),
  app = express(),
  puppeteer = require("puppeteer"),
  uniqid = require("uniqid");

const port = 55002;
let browser = null;
const screenShotSize = { width: 1920, height: 1080 };
const savePath = "images/";
const apiPw = "aligulec";
const browser_ac = async () => {
  browser = await puppeteer.launch({
    args: ["--no-sandbox", "--hide-scrollbars"],
    headless: true,
  });
  browser.on("disconnected", browser_ac);
};

(async () => {
  await browser_ac();
})();
app.use(express.json());

app.get("/:pw/:url", async (req, res) => {
  if (req.params.pw != apiPw) {
    return res.send("Erişim Yasağı");
  }
  var t0 = new Date().getTime();
  try {
    let page = await browser.newPage();
    await page.setViewport(screenShotSize);

    let url = req.params.url;
    await page.goto(url);
    await page.waitForTimeout(1000);

    // await autoScroll(page);  "httpdocs/ps/images/" + filename,
    let filename = uniqid() + "_" + new URL(url).host + ".png";
    const image = await page.screenshot({
      fullPage: false,
      path: savePath + filename,
      fullScreen: true,
    });
    var t1 = new Date().getTime();
    await page.close();
    let islemSuresi = (t1 - t0) / 1000;
    let cevap = {
      url,
      durum: "ok",
      filename,
      islemSuresi,
    };
    res.json(cevap);
  } catch (error) {
    var t1 = new Date().getTime();
    let islemSuresi = (t1 - t0) / 1000;

    let cevap = {
      durum: "error",
      hata: error.toString(),
      islemSuresi,
    };
    res.json(cevap);
  }
});
app.get("*", function (req, res) {
  let cevap = {
    durum: "hata",
    hata: "hatalı çağrı",
  };
  res.json(cevap);
});
// await browser.close();
app.listen(port, "0.0.0.0", function () {
  console.log("Uygulama çalışıyor.Port: " + port);
});

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 300;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
