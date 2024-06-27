// Scrape.js defines the routines for scraping Google Maps / Food.google for menu information

import { filterGFMenuItems } from './parse-gluten-free.js';
import * as codes from './gf-codes.js';

// Import puppeteer web scraper module
import { Cluster } from 'puppeteer-cluster';
import { RestaurantDetails } from './gf-codes.js';

// Selectors for elements
const orderOnlineSelector = 'a[href^="https://food.google.com/chooseprovider"';
const itemContainerSelector = '.WV4Bob';
const itemNameSelector = '.bWZFsc';
const itemDescSelector = '.gQjSre';

// Redefine timeout & configure browser options
export const TIMEOUT_MS = 5000; 

const cluster = await Cluster.launch({
  concurrency: Cluster.CONCURRENCY_CONTEXT,
  maxConcurrency: 5,
})

await cluster.task(async({ page, data }) => {
  const mapuri = data;
  page.setDefaultTimeout(TIMEOUT_MS);
  page.setDefaultNavigationTimeout(TIMEOUT_MS);

  try {
    await page.goto(mapuri);
  } catch (error) {
    throw {name: "LINK_NOT_ACCESSIBLE", message: "There was a problem accessing the URL: " + mapUri}; 
  }
  
  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  // Disable image loading
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if(req.resourceType() === 'image' || req.resourceType() === 'media' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') { req.abort();}
    else { req.continue(); }
  });

  let mapstart = Date.now();
  try {
    await page.waitForNavigation({waitUntil: 'domcontentloaded'});
    console.log("Took", Date.now() - mapstart, " ms to load the Google Maps DOM", mapuri);
    await page.waitForSelector(orderOnlineSelector);
    console.log("Took", Date.now() - mapstart, " ms to load the Google Maps Page", mapuri);
  } catch (error) {
    // Order Online button doesn't appear
    console.log("Took", Date.now() - mapstart, " ms to have an error loading load the Google Order Online Selector (on Maps)", mapuri);
    throw {name: "MENU_NOT_FOUND", message: "Could not access menu given the URL: " + mapuri};
  }
  await page.click(orderOnlineSelector);
  await page.waitForNavigation({waitUntil: 'domcontentloaded'});
  let foodStart = Date.now();
  try {
    await page.waitForSelector(itemContainerSelector);
    console.log("Took", Date.now() - foodStart, " ms to load the Google Foods Page", mapuri);
  } catch (error) {
    // Google Foods menu doesn't appear (only lists third-party providers)
    console.log("Took", Date.now() - foodStart, " ms to have trouble accessing the menu on the Google Foods Page", mapuri);
    throw {name: "MENU_NOT_FOUND", message: "Could not access menu given the URL: " + mapuri};
  }

  const menuItems = await page.evaluate((itemContainerSelector, itemNameSelector, itemDescSelector) => {
    // Get all menu item containers
    const productCollection = document.querySelectorAll(itemContainerSelector);
    const result = [];
    
    // Get the name and description for each menu item.
    productCollection.forEach((product) => {
      const itemName = product.querySelector(itemNameSelector)?.innerText;
      const itemDescription = product.querySelector(itemDescSelector)?.innerText;

      result.push({name : itemName, desc: itemDescription});
    })

    return result;
  }, itemContainerSelector, itemNameSelector, itemDescSelector);

  return menuItems;
});

/**
 * Scrapes a given restaurant for all explicitly GF-marked items and stores any GF menu items into the RestaurantDetails object
 * @param {RestaurantDetails} resJSON The restaurant details object to store the newly scraped menu information
 */
let getGFMenu = async(resJSON) => {
  if (!resJSON) { return null; }

  let menuItems = [];
  
  try {
    menuItems = await cluster.execute(resJSON.mapuri);
    filterGFMenuItems(menuItems); 
  }
  catch (error) {
      // Stub error handling for now
      if (error.name === "MENU_NOT_FOUND") { 
        resJSON.gfrank = codes.MENU_NOT_ACCESSIBLE;
        return resJSON; 
      }
      if (error.name === "LINK_NOT_ACCESSIBLE") { 
        resJSON.gfrank = codes.LINK_INACCESSIBLE;
        return resJSON; 
      }
  }
  
  // No explicitly-asserted GF items available
  if (menuItems.length == 0) {
    resJSON.gfrank = codes.NO_MENTION_GF;
  } else {
    resJSON.items = menuItems;
    resJSON.gfrank = codes.HAS_GF_ITEMS;
  }
  return resJSON;
}

export { getGFMenu };