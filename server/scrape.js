// Scrape.js defines the routines for scraping Google Maps / Food.google for menu information

// Import puppeteer web scraper module
import * as puppeteer from "puppeteer";
import * as gf from './parse-gluten-free.js';
import * as codes from './gf-codes.js';

// Selectors for elements
const orderOnlineSelector = 'a[href^="https://food.google.com/chooseprovider"';
const menuItemSelector = '.WV4Bob';

// Scraping format
const NAME = 0;
const DESCRIPTION = 2;

// Error Codes
const NOT_FOUND = [];

// Define singular browser to be used
let browser = null;

// Redefine timeout & configure browser options
export const TIMEOUT_MS = 10000; 
const options = {
  args: [
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ],
  headless: true
}

// Define tab limit on browser and count to track the limit
const TAB_LIMIT = 5;
let tabCount = 0;
let scrapeQueue = [];

let initializePuppeteer = async() => {
  if (!browser) { browser = await puppeteer.launch(options); }
}

let closeTab = async(page) => {
  if (page == null) { return; }
  await page.close();
  tabCount--;
}

async function dispatchScraper() {
  if (tabCount > TAB_LIMIT || scrapeQueue.length == 0) {
     return ;
  }
  
  let front = scrapeQueue.shift();
  getGFMenu(front.id, front.mapUri)
     .then((response) => {
        if (response) {
           console.log(response); // do send here
           dispatchScraper();
        }
     });
}

let enqueueRestaurant = async(id, mapUri) => {
  scrapeQueue.push({"id" : id, "mapUri" : mapUri});
}

/**
 * Scrapes the specified Google Maps page for MenuItems
 * @param {String} mapUri The Google Maps uri to access a specified restauraut
 * @returns {String|Array} Array of menu-items and their descriptions; or an empty list if no items could be scraped from its food.google page
 */
const scrapeMap = async(mapUri, pageWrapper) => { 
  if (!browser) { await initializePuppeteer(); }
  
  let page = await browser.newPage();
  pageWrapper.page = page;
  await page.goto(mapUri);
  
  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  // Navigating to Google Food: ait for Order Online Button to appear & click
  await Promise.all([
    page.waitForSelector(orderOnlineSelector, {timeout: TIMEOUT_MS}),
    page.click(orderOnlineSelector),
    page.waitForNavigation({waitUntil: 'domcontentloaded'})
  ]);

  // Scrape available menu items
  let menuItems = [];
  // Wait for menu items to appear
  await page.waitForSelector(menuItemSelector, {timeout: TIMEOUT_MS});
  // Take the text content from menu items (name, price, description) and propogate allItems
  menuItems = await page.evaluate(() => 
    [...document.querySelectorAll('.WV4Bob')].map(({ innerText }) => innerText)
  );

  // await closeTab(page);
  return menuItems;
};

let getGFMenu = async(id, mapUri) => {
  if (!id || !mapUri) { return {}; }
  
  // Since we pop the front of the queue in dispatch, if we don't end up processing
  // we re-add the restaurant to be scraped
  if (await (tabCount + 1 > TAB_LIMIT)) {
    enqueueRestaurant(id, mapUri);
    return null;
  }
  await (tabCount++);
  // console.log(await tabCount);

  // Define the menuJSON response template
  let menuJSON = codes.resFormat(id);

  // Scrape Google Maps for all menu items
  let menuItems;
  let pageWrapper = { page: null };
  await scrapeMap(mapUri, pageWrapper)
    .then(res => {
      menuItems = res;
    })
    .catch(error => {
      console.error(`Could not access: ${mapUri}: \n${error}`);
      menuItems = NOT_FOUND;
    })
    
  await closeTab(pageWrapper.page);
  
  // HANDLE MENU NOT FOUND
  if (menuItems == NOT_FOUND) {
    menuJSON[id].gfRank = codes.MENU_NOT_ACCESSIBLE;
    return menuJSON; 
  }  
  
  // Filter all GF items from the menu
  gf.filterGFMenuItems(menuItems); 

  // No explicitly-asserted GF items available
  if (menuItems.length == 0) {
    menuJSON[id].gfRank = codes.NO_MENTION_GF;
    return menuJSON;
  }

  // Append all GF items to the JSON response
  menuJSON[id].gfRank = codes.HAS_GF_ITEMS;
  menuItems.forEach(item => {
    // Split item into name, price, description (ie. on newline)
    let expandItem = item.split('\n');
    menuJSON[id].gfItems.push(
      {"name" : expandItem[NAME], 
      "desc" : expandItem[DESCRIPTION]}
    );
  });

  return menuJSON;
}

let log = async(id, url) => {
  console.log(await getGFMenu(id, url));
}

export { getGFMenu, dispatchScraper, enqueueRestaurant };