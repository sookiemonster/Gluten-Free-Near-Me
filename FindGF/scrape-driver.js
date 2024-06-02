import * as scrape from './scrape.js';
import * as puppeteer from "puppeteer";

// Define singular browser and page to be used
export let browser, page = null;

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

 // Define a queue to hold all queued restaraunts to scrape
let scrapeQueue = [];

export let initializePuppeteer = async() => {
   if (!browser) { browser = await puppeteer.launch(options); }
   if (!page) { page = await browser.newPage(); }
}

export let processNextScrape = async() => {
   await initializePuppeteer();

   if (scrapeQueue.length == 0) {
      // No more jobs to be done, exit browser & page
      browser.close()
         .then(() => { 
            browser = null; 
            page = null;
            return; })
         .catch((error) => {
            console.error("An error occurred while terminating the scrape: ")
            console.error(error);
            return;
         });
   } else {
      // Get the menu of the next possible item in the queue
      scrape.getGFMenu(scrapeQueue[0].id, scrapeQueue[0].mapUri)
         .then((response) => {
            console.log(response);
            scrapeQueue.shift();
         })
         .then(() => { 
            processNextScrape(); 
         })
         .catch((error) => {console.log(error)});
   }

}

export let enqueueRestaurant = (id, mapUri) => {
   scrapeQueue.push({"id" : id, "mapUri" : mapUri});
}