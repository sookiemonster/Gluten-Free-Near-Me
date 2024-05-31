// Import puppeteer web scraper module
const puppeteer = require('puppeteer');
const gf = require('./parse-gluten-free');

// Redefine timeout
const TIMEOUT_MS = 10000; 

// Selectors for elements
const orderOnlineSelector = 'a[href^="https://food.google.com/chooseprovider"';
const menuItemSelector = '.WV4Bob';

// Error Codes
const NOT_FOUND = [];

/**
 * Scrapes the specified Google Maps page for MenuItems
 * @param {String} map_uri The Google Maps uri to access a specified restauraut
 * @returns {String|Array} Array of menu-items and their descriptions; or an empty list if no items could be scraped from its food.google page
 */
const scrapeMap = async(map_uri) => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(map_uri);

  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  // Navigating to Google Food
  try {
    // Wait for Order Online Button to appear & click
    await page.waitForSelector(orderOnlineSelector, {timeout: TIMEOUT_MS});
    await page.click(orderOnlineSelector);

  } catch (error) {
    // The Order Online Button did not appear (loading failure or order online not available)
    return NOT_FOUND;
  }

  // Scrape available menu items
  let menuItems = [];
  try {
    // Wait for menu items to appear
    await page.waitForSelector(menuItemSelector, {timeout: TIMEOUT_MS});
    // Take the text content from menu items (name, price, description) and propogate allItems
    menuItems = await page.evaluate(() => 
      [...document.querySelectorAll('.WV4Bob')].map(({ innerText }) => innerText)
    );
  } catch (error) {
    // Search other vendors, but Seamless & GrubHub block scraping with Captcha
    //  so it may not be feasible as of now
    return NOT_FOUND;
  }

  await browser.close();
  return menuItems;
};

let main = async() => {
  let menuItems = await scrapeMap("https://maps.app.goo.gl/16AUqQgefQuoBHBk6");
  gf.filterGFMenuItems(menuItems);
  console.log(menuItems);
}

main();
// menuItems.forEach(element => {
//   console.log(element);
// });
  // .then((items) => {
  //   items.forEach(element => {
  //   });
  // });
  // .catch(TimeoutError)