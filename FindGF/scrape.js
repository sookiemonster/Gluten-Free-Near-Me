// Import puppeteer web scraper module
const puppeteer = require('puppeteer');
const gf = require('./parse-gluten-free');
const codes = require('./gf-codes');

// Redefine timeout
const TIMEOUT_MS = 10000; 

// Selectors for elements
const orderOnlineSelector = 'a[href^="https://food.google.com/chooseprovider"';
const menuItemSelector = '.WV4Bob';

// Scraping format
const NAME = 0;
const DESCRIPTION = 2;

// Error Codes
const NOT_FOUND = [];

/**
 * Scrapes the specified Google Maps page for MenuItems
 * @param {String} mapUri The Google Maps uri to access a specified restauraut
 * @returns {String|Array} Array of menu-items and their descriptions; or an empty list if no items could be scraped from its food.google page
 */
const scrapeMap = async(mapUri) => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(mapUri);

  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  // Navigating to Google Food
  try {
    // Wait for Order Online Button to appear & click
    await Promise.all([
      page.waitForSelector(orderOnlineSelector, {timeout: TIMEOUT_MS}),
      page.click(orderOnlineSelector),
      page.waitForNavigation({waitUntil: 'networkidle2'})
    ]);


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

let getGFMenu = async(id, mapUri) => {
  // Define the menuJSON response template
  let menuJSON = {
    [id] : {
      "gfRank" : 0, 
      "items" : []
    }
  };

  // Scrape Google Maps for all menu items
  let menuItems = await scrapeMap(mapUri);
  
  // HANDLE MENU NOT FOUND
  if (menuItems == NOT_FOUND) {
    menuJSON[id].gfRank = codes.MENU_NOT_ACCESSIBLE;
    return; 
  }  
  
  // Filter all GF items from the menu
  gf.filterGFMenuItems(menuItems); 

  // No explicitly-asserted GF items available
  if (menuItems.length == 0) {
    
  }

  // Append all GF items to the JSON response
  menuItems.forEach(item => {
    // Split item into name, price, description (ie. on newline)
    let expandItem = item.split('\n');
    menuJSON[id].items.push(
      {"name" : expandItem[NAME], 
      "desc" : expandItem[DESCRIPTION]}
    );
  });
  console.log(menuJSON[id]);
  
  // console.log(menuItems);
}

let test = async() => {
  getGFMenu("ChIJ8Q2WSpJZwokRQz-bYYgEskM", "https://maps.app.goo.gl/16AUqQgefQuoBHBk6");
  // getGFMenu("https://maps.app.goo.gl/QaNzDfEq9Y1Zu8xR9");
  // getGFMenu("https://maps.app.goo.gl/9doyvWjQNyt5r8Lp6");
}

test();
// menuItems.forEach(element => {
//   console.log(element);
// });
  // .then((items) => {
  //   items.forEach(element => {
  //   });
  // });
  // .catch(TimeoutError)