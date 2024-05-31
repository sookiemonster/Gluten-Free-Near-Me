// Import puppeteer web scraper module
var puppeteer = require('puppeteer');

// Redefine timeout
const TIMEOUT_MS = 10000; 

// Selectors for menu-items
const orderOnlineSelector = 'a[href^="https://food.google.com/chooseprovider"';
const menuItemSelector = '.WV4Bob';

const scrapeMap = async() => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto('https://maps.google.com/?cid=17299868738663185922');

  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  // Navigating to Google Food
  try {
    // Wait for Order Online Button to appear
    await page.waitForSelector(orderOnlineSelector, {timeout: TIMEOUT_MS});
  } catch (error) {
    // The Order Online Button did not appear (loading failure or order online not available)
    return [];
  }


  await page.click(orderOnlineSelector);

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
    // Search other vendors
  }

  await browser.close();
  return menuItems;
};

scrapeMap()
  .then((items) => {
    items.forEach(element => {
      console.log(element);
    });
  });
  // .catch(TimeoutError)