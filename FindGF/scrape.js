// Scrape.js defines the routines for scraping Google Maps / Food.google for menu information

// Import puppeteer web scraper module
import * as puppeteer from "puppeteer";
import * as gf from './parse-gluten-free.js';
import * as codes from './gf-codes.js';
import { browser, initializePuppeteer, tallyScraper, closeTab, TIMEOUT_MS, tabCount, TAB_LIMIT, enqueueRestaurant } from './scrape-driver.js';

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
  if (!browser) { await initializePuppeteer(); }
  
  let page = await browser.newPage();
  try {
    await page.goto(mapUri);
  } catch (error) {
    console.error("Error loading: " + mapUri);
    await closeTab(page);
    return NOT_FOUND;
  }
  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  // Navigating to Google Food
  try {
    // Wait for Order Online Button to appear & click
    await Promise.all([
      page.waitForSelector(orderOnlineSelector, {timeout: TIMEOUT_MS}),
      page.click(orderOnlineSelector),
      page.waitForNavigation({waitUntil: 'domcontentloaded'})
    ]);


  } catch (error) {
    // The Order Online Button did not appear (loading failure or order online not available)
    // closeTab(page);
    await console.log(page.url());
    await closeTab(page);

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
    // closeTab(page);
    await closeTab(page);

    return NOT_FOUND;
  }

  await closeTab(page);
  return menuItems;
};

let getGFMenu = async(id, mapUri) => {
  if (!id || !mapUri) { return {}; }
  
  // Since we pop the front of the queue in dispatch, if we don't end up processing
  // we re-add the restaurant to be scraped
  if (tabCount + 1 > TAB_LIMIT) {
    enqueueRestaurant(id, mapUri);
    return null;
  }
  await tallyScraper();
  console.log(await tabCount);

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
    menuJSON[id].items.push(
      {"name" : expandItem[NAME], 
      "desc" : expandItem[DESCRIPTION]}
    );
  });

  return menuJSON;
}

let log = async(id, url) => {
  console.log(await getGFMenu(id, url));
}

export { getGFMenu };