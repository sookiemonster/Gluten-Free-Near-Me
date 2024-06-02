import * as scrape from './scrape.js';
import * as puppeteer from "puppeteer";

// Define singular browser and page to be used
export let browser = null;

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

export let limitTabs = async() => {
   console.log ( (await browser.pages()).length );
}