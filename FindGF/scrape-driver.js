import * as scrape from './scrape.js';
import * as puppeteer from "puppeteer";

// Define singular browser to be used
export let browser = null;

export const TAB_LIMIT = 3;
export let tabCount = 0;
let scrapeQueue = [];

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

export let enqueueRestaurant = async(id, mapUri) => {
   scrapeQueue.push({"id" : id, "mapUri" : mapUri});
}

export let dispatchScraper = async() => {
   if (tabCount > TAB_LIMIT || scrapeQueue.length == 0) {
      return ;
   }
   
   let front = scrapeQueue.shift();
   scrape.getGFMenu(front.id, front.mapUri)
      .then((response) => {
         if (response) {
            console.log(response); // do send here
            console.log(tabCount);
            dispatchScraper();
         }
      });
}

export let initializePuppeteer = async() => {
   if (!browser) { browser = await puppeteer.launch(options); }
}

export let tallyScraper = async() => {
   tabCount++;
}

export let closeTab = async(page) => {
   await page.close();
   tabCount--;
}