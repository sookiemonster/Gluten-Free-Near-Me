import * as scrape from './scrape.js';
import * as puppeteer from 'puppeteer';
import { DEBUG } from './debug-control.js';

// Define singular browser to be used
export let browser = null;

export const TAB_LIMIT = 5;
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


export let initializePuppeteer = async() => {
   if (!browser) { browser = await puppeteer.launch(options); }
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
            dispatchScraper();
         }
      });
}

export let enqueueRestaurant = async(id, mapUri, usr) => {
   scrapeQueue.push({"id" : id, "mapUri" : mapUri});
}

export let tallyScraper = async() => {
   tabCount++;
}

export let closeTab = async(page) => {
   if (page == null) { return; }
   await page.close();
   tabCount--;
}