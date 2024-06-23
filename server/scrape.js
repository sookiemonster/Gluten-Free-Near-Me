// Scrape.js defines the routines for scraping Google Maps / Food.google for menu information

import { filterGFMenuItems } from './parse-gluten-free.js';
import * as codes from './gf-codes.js';

// Import puppeteer web scraper module
import * as puppeteer from "puppeteer";
import { Cluster } from 'puppeteer-cluster';


import { RestaurantDetails } from './gf-codes.js';

// import { appEmitter, db } from "./app.js";

// Selectors for elements
const orderOnlineSelector = 'a[href^="https://food.google.com/chooseprovider"';
const itemContainerSelector = '.WV4Bob';
const itemNameSelector = '.bWZFsc';
const itemDescSelector = '.gQjSre';

// Scraping format
const NAME = 0;
const DESCRIPTION = 2;

// Error Codes
const NOT_FOUND = [];
const LINK_FAILED = [-1];
const RESOLVE_LIMIT = 1;

// Redefine timeout & configure browser options
export const TIMEOUT_MS = 4000; 

const cluster = await Cluster.launch({
  concurrency: Cluster.CONCURRENCY_CONTEXT,
  maxConcurrency: 5,
})

await cluster.task(async({ page, data }) => {
  const mapuri = data;

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
    if(req.resourceType() === 'image' || req.resourceType() === 'media') { req.abort();}
    else { req.continue(); }
  });

  try {
    await page.waitForSelector(orderOnlineSelector, {timeout: TIMEOUT_MS});
  } catch (error) {
    // Order Online button doesn't appear
    throw {name: "MENU_NOT_FOUND", message: "Could not access menu given the URL: " + mapuri};
  }
  await page.click(orderOnlineSelector);
  await page.waitForNavigation({waitUntil: 'domcontentloaded'});
  try {
    await page.waitForSelector(itemContainerSelector, {timeout: TIMEOUT_MS});
  } catch (error) {
    // Google Foods menu doesn't appear (only lists third-party providers)
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
  // console.log(result);

getGFMenu(RestaurantDetails("id", "https://maps.app.goo.gl/B75aKExVfp678XxS6", 0.0, 0.0, "A place!", 5.0))
  .then(res => console.log(res))
  .catch(err => console.error(err));
getGFMenu(RestaurantDetails("id", "https://maps.app.goo.gl/tPSujJrVK2TjKnot7", 0.0, 0.0, "A place!", 5.0))
  .then(res => console.log(res))
  .catch(err => console.error(err))

export { getGFMenu };