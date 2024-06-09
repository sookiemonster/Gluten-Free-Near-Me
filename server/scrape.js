// Scrape.js defines the routines for scraping Google Maps / Food.google for menu information

// Import puppeteer web scraper module
import * as puppeteer from "puppeteer";
import * as gf from './parse-gluten-free.js';
import * as codes from './gf-codes.js';
import { appEmitter } from "./app.js";

// Selectors for elements
const orderOnlineSelector = 'a[href^="https://food.google.com/chooseprovider"';
const menuItemSelector = '.WV4Bob';

// Scraping format
const NAME = 0;
const DESCRIPTION = 2;

// Error Codes
const NOT_FOUND = [];

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
  headless: false
}
// Define singular browser to be used
let browser = await puppeteer.launch(options);;

// Define tab limit on browser and count to track the limit
const TAB_LIMIT = 5;
let tabCount = 0;
let scrapeQueue = [];

/**
 * Closes a page and decrements the tab counter
 * @param page The page to be closed
 */
let closeTab = async(page) => {
  if (page == null) { return; }
  await page.close();
  tabCount--;
}

/**
 * Decides whether to continue scraping the next restaurant in the scrapeQueue
 * Scrapes if there are less tabs than the TAB LIMIT and there are more sites to be scraped 
 */
async function dispatchScraper() {
  if (tabCount > TAB_LIMIT || scrapeQueue.length == 0) {
     return ;
  }
  
  let front = scrapeQueue.shift();
  if (front != null) {
    getGFMenu(front.id, front.mapUri)
       .then((response) => {
          if (response) {
            // console.log(response); 
            appEmitter.broadcastRestaurant(response);
            dispatchScraper();
          }
        })
        .catch(gfNotFound => {
          // console.error("RETURNED: " + err);
          appEmitter.broadcastRestaurant(gfNotFound);
          dispatchScraper();
      }
    );
  }
}

/**
 * Queues a restaurant to be scraped
 * @param {String} id The Google place id of the target restaurant
 * @param {String} mapUri The Google mapURI of the target restaurant
 */
let enqueueRestaurant = async(id, mapUri) => {
  scrapeQueue.push({"id" : id, "mapUri" : mapUri});
}

/**
 * Scrapes the specified Google Maps page for MenuItems
 * @param {String} mapUri The Google Maps uri to access a specified restauraut
 * @returns {Promise|String|Array} Array of menu-items and their descriptions; or an empty list if no items could be scraped from its food.google page
 */
const scrapeMap = async(mapUri, pageWrapper) => { 

  // Navigating to Google Food: ait for Order Online Button to appear & click
  let page = await browser.newPage();
  pageWrapper.page = page;
  await page.goto(mapUri);
  
  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  // Disable image loading
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if(req.resourceType() === 'image' || req.resourceType() === 'media') { req.abort();}
    else { req.continue(); }
  });
  
  return new Promise((resolve, reject) => {
    page.waitForSelector(orderOnlineSelector, {timeout: TIMEOUT_MS})
      .then(() => {return page.click(orderOnlineSelector)})
      .then(() => {return page.waitForNavigation({waitUntil: 'domcontentloaded'})})
      .then(() => {return page.waitForSelector(menuItemSelector, {timeout: TIMEOUT_MS}) })
      .then(() => {return page.evaluate(() => 
        [...document.querySelectorAll('.WV4Bob')].map(({ innerText }) => innerText)
      )})
      .then(menuItems => {
        if (menuItems.length != 0) {
            return resolve(menuItems);
          } else {
            return reject(NOT_FOUND);
          }
      })
      .catch(err => { 
        // console.error(err);
        return reject(NOT_FOUND);
      });
    });
}

/**
 * Scrapes a given restaurant for all explicitly GF-marked items
 * @param {String} id The Google place id of the target restaurant
 * @param {String} mapUri The Google mapURI of the target restaurant
 * @returns {JSON} Returns a JSON containing all GF-items offered at the restaurant in the following form:
 *    <id> : {
         "gfSum" : "",
         "gfRank" : <GF_RANK>, 
         "gfReviews" : [],
         "gfItems" : [ITEM_1, ITEM_2, ...]
      }
 * @note The GF summary & reviews are empty.
 */
let getGFMenu = async(id, mapUri) => {
  if (!id || !mapUri) { return {}; }
  
  // Since we pop the front of the queue in dispatch, if we don't end up processing
  // we re-add the restaurant to be scraped
  if (tabCount + 1 > TAB_LIMIT) {
    enqueueRestaurant(id, mapUri);
    return null;
  }
  await tabCount++;

  // Define the menuJSON response template
  let menuJSON = codes.resFormat(id);

  // Scrape Google Maps for all menu items
  let pageWrapper = { page: null };

  return new Promise((resolve, reject) => {
    scrapeMap(mapUri, pageWrapper)
      .then(async(res) => {
        await closeTab(pageWrapper.page);
        return res;
      })
      .then((menuItems) => {
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

        return resolve(menuJSON);
      })
      
      .catch(async(error) => {
        console.error(`Could not access: ${mapUri}: \n${error}`);
        await closeTab(pageWrapper.page);
      })
      .then(() => {
        menuJSON[id].gfRank = codes.MENU_NOT_ACCESSIBLE;
        return reject(menuJSON);
      });
  });

}

let log = async(id, url) => {
  console.log(await getGFMenu(id, url));
}

export { getGFMenu, dispatchScraper, enqueueRestaurant };