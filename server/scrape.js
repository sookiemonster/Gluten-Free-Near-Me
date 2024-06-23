// Scrape.js defines the routines for scraping Google Maps / Food.google for menu information

import * as gf from './parse-gluten-free.js';
import * as codes from './gf-codes.js';

// Import puppeteer web scraper module
import * as puppeteer from "puppeteer";
import { Cluster } from 'puppeteer-cluster';
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
  console.log(menuItems);

  return menuItems;
});

/**
 * Scrapes a given restaurant for all explicitly GF-marked items and stores any GF menu items into the RestaurantDetails object
 * @param {RestaurantDetails} resJSON The restaurant details object to store the newly scraped menu information
 */
let getGFMenu = async(resJSON) => {
  if (!resJSON) { return null; }
  
  // Since we pop the front of the queue in dispatch, if we don't end up processing
  // we re-add the restaurant to be scraped
  if (tabCount + 1 > TAB_LIMIT) {
    enqueueRestaurant(resJSON);
    return null;
  }
  await tabCount++;
  resJSON.resolveAttempts++;
  
  // Scrape Google Maps for all menu items
  let pageWrapper = { page: null };
  
  return new Promise((resolve, reject) => {
    scrapeMenu(resJSON.mapuri, pageWrapper)
      .then(async(res) => {
        await closeTab(pageWrapper.page);
        return res;
      })
      .then((menuItems) => {
        gf.filterGFMenuItems(menuItems); 

        // No explicitly-asserted GF items available
        if (menuItems.length == 0) {
          resJSON.gfrank = codes.NO_MENTION_GF;
          return resJSON;
        }

        // Append all GF items to the JSON response
        resJSON.gfrank = codes.HAS_GF_ITEMS;
        menuItems.forEach(item => {
          // Split item into name, price, description (ie. on newline)
          let expandItem = item.split('\n');
          resJSON.items.push(
            {"name" : expandItem[NAME], 
            "desc" : expandItem[DESCRIPTION]}
          );
        });

        return resolve(resJSON);
      })
      
      .catch(async(error) => {
        // console.error(`Could not access ${resJSON.name}: ${resJSON.mapUri}. Tried ${resJSON.resolveAttempts} times: \n${error}.`);
        console.error(`Could not access ${resJSON.name}: ${resJSON.mapuri}. Tried ${resJSON.resolveAttempts} times: \n.`);
        await closeTab(pageWrapper.page);
        
        // If we have reached the number of attempts to scrape the map, stop scraping and send an inaccessible
        if (resJSON.resolveAttempts < RESOLVE_LIMIT) {
          enqueueRestaurant(resJSON);
        }
        
        if (error == LINK_FAILED) {
          resJSON.gfrank = codes.LINK_INACCESSIBLE;
        } else {
          resJSON.gfrank = codes.MENU_NOT_ACCESSIBLE;
        }
        return reject(resJSON);
      });
  });

}

cluster.execute("https://maps.app.goo.gl/B75aKExVfp678XxS6")
  .then(menuItems => console.log(menuItems))
  .catch(error => console.error(error));

cluster.execute("https://maps.app.goo.gl/fFjYc9CHoGAtvvNSA")
  .then(menuItems => console.log(menuItems))
  .catch(error => console.error(error));
  // console.log(result);

// getGFMenu({mapuri:"https://maps.app.goo.gl/B75aKExVfp678XxS6"});


// export { getGFMenu, dispatchScraper };