// Scrape.js defines the routines for scraping Google Maps / Food.google for menu information

import { filterGFMenuItems } from './parse-gluten-free.js';
import * as codes from './gf-codes.js';

// Import puppeteer web scraper module
import { Cluster } from 'puppeteer-cluster';
import { RestaurantDetails } from './gf-codes.js';

// Selectors for elements
const orderOnlineSelector = 'a[href^="https://www.google.com/viewer/chooseprovider'
const providerSelector = 'div[ssk="23:2Storefront by DoorDash"] > a'

const menuItemSelector = 'div[data-anchor-id="MenuItem"]'
const nameSelector = 'h3[data-telemetry-id="storeMenuItem.title"]'
const descSelector = 'span[data-telemetry-id="storeMenuItem.subtitle"]'

// Redefine timeout & configure browser options
export const TIMEOUT_MS = 5000; 

const cluster = await Cluster.launch({
  concurrency: Cluster.CONCURRENCY_CONTEXT,
  maxConcurrency: 5,
  puppeteerOptions: {
    headless: false}
})

await cluster.task(async({ page, data }) => {
  const mapuri = data;
  console.log(`ATTEMPTING SCRAPE: ${data}`)

  page.setDefaultTimeout(TIMEOUT_MS);
  page.setDefaultNavigationTimeout(TIMEOUT_MS);
  await page.setViewport({width: 1080, height: 1024});

  // Disable image loading
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if(req.resourceType() === 'image') { req.abort();}
    else { req.continue(); }
  });

  try {
      await page.goto(mapuri);
      await page.waitForNavigation({waitUntil: 'domcontentloaded'});
  } catch (error) {
      throw {name: "LINK_NOT_ACCESSIBLE", message: "There was a problem accessing the URL: " + mapUri}; 
  }
    
  try {
    // Get the Order Online Button
    await page.waitForSelector(orderOnlineSelector);
    await page.click(orderOnlineSelector);
    await page.waitForNavigation({waitUntil: 'domcontentloaded'});
    
    // Navigate to DoorDash StoreFront 
    await page.waitForSelector(providerSelector);
    await page.click(providerSelector);
    await page.waitForNavigation({waitUntil: 'domcontentloaded'});

  } catch (error) {   
    throw {name: "MENU_NOT_FOUND", message: "There was a problem accessing the URL: " + mapUri}; 
  }

  console.log("MADE IT TO MENU_ITEMS")

  const menuItems = await page.evaluate(async (menuItemSelector, nameSelector, descSelector) => {
    return new Promise((resolve, reject) => {
      const distance = 140 * 3;
      var heightObject = { totalHeight: 0};
      var result = [];
      var unique = new Set();
        
      const timer = setInterval(() => {
          if (heightObject.totalHeight >= document.body.scrollHeight) {
              clearInterval(timer);
              console.log("complte!", result);
              resolve(result);
          } else {
              window.scrollBy(0, distance);
              heightObject.totalHeight += distance;
              
              console.log("selecting items: ", menuItemSelector);
              const productCollection = document.querySelectorAll(menuItemSelector);
              
              console.log("queried:", productCollection);
              productCollection.forEach((product) => {
                  const itemName = product.querySelector(nameSelector)?.innerText;
                  
                  if (!unique.has(itemName)) {
                      // Get the description and add if we haven't already
                      const itemDescription = product.querySelector(descSelector)?.innerText;
                      unique.add(itemName);
                      result.push({name : itemName, desc: itemDescription});
                  }
              })
          }
      }, 250);
    })
  }, menuItemSelector, nameSelector, descSelector )

  return menuItems;
});

/**
 * Scrapes a given restaurant for all explicitly GF-marked items and stores any GF menu items into the RestaurantDetails object
 * @param {RestaurantDetails} resJSON The restaurant details object to store the newly scraped menu information
 */
let getGFMenu = async(resJSON) => {
  if (!resJSON) { 
    console.log("No restaurant supplied to get a GF Menu.")
    return null; 
  }

  let menuItems = [];
  
  try {
    menuItems = await cluster.execute(resJSON.mapuri);
    filterGFMenuItems(menuItems); 
  }
  catch (error) {
      // Stub error handling for now
      if (error.name === "MENU_NOT_FOUND") { resJSON.gfrank = codes.MENU_NOT_ACCESSIBLE; }
      if (error.name === "LINK_NOT_ACCESSIBLE") { resJSON.gfrank = codes.LINK_INACCESSIBLE; }
      return resJSON; 
  }
  
  // No explicitly-asserted GF items available
  if (menuItems.length == 0) {
    resJSON.gfrank = codes.NO_MENTION_GF;
  } else {
    resJSON.items = menuItems;
    resJSON.gfrank = codes.HAS_GF_ITEMS;
    console.log("IT HAS GF.", resJSON);
  }
  return resJSON;
}

export { getGFMenu };