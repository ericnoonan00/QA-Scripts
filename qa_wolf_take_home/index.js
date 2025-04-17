// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const { expect } = require('playwright/test');

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // vvv Eric Noonan Code vvv

  // rank => age
  const times = new Map();
  for (let i = 0; i <= 3; i ++) {
    // create an offset to create labels
    let rankOffset = i * 30 // articles on each page

    // iterate through each page
    for (let j = 0; j < 30; j ++) {
      // check the size of the map
      if (times.size === 100) break;

      // map the timestamps to an order
      // need to convert the locator to a string to crop out the last part of the date string, then convert to a date to compare
      // ( i really dont know what that part is, but its an invalid date when converting with new Date() )
      let rank = j + rankOffset + 1  // this will equal the rank of the article on the page, making it easier to indentify where the error is
      times.set(
        rank,
        new Date(
          String(
            await page.locator('.age').nth(j).getAttribute('title') // e.g "2025-04-13T16:04:07 1744560247"
          ).slice(0, 19)
        )
      )

      let newer = times.get(j - 1)
      let older = times.get(j)

      // check for error at each iteration with a try catch or...
      try {
        if (newer < older) {
          const errLocation = await page.locator('.athing submission', { has: page.locator('.rank='+rank)})
          throw new Error("found incorrect order at " + errLocation)
        }
      } catch (err) {
        console.error(err);
      }
      
      // ... a more playwright forward error checking
      await expect(newer < older).toBeFalsy()
    }

    // switch the page (we don't need to do it on the last iter.)
    if (i == 3) continue; 
    await page.locator('.morelink').click()
    await page.waitForLoadState('domcontentloaded') // wait for the next links to load up in the case of slow wifi
    
  }
  
  console.log(times);
}

(async () => {
  await sortHackerNewsArticles()
})()


