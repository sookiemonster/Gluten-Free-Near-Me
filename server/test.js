import puppeteer from 'puppeteer';

import { filterGFMenuItems } from './parse-gluten-free.js';

// Or import puppeteer from 'puppeteer-core';

// Launch the browser and open a new blank page
const browser = await puppeteer.launch({headless: false});
const page = await browser.newPage();


const orderOnlineSelector = 'a[href^="https://www.google.com/viewer/chooseprovider'
const providerSelector = 'div[ssk="23:2Storefront by DoorDash"] > a'


const menuItemSelector = 'div[data-anchor-id="MenuItem"]'
const nameSelector = 'h3[data-telemetry-id="storeMenuItem.title"]'
const descSelector = 'span[data-telemetry-id="storeMenuItem.subtitle"]'

// DEMO
// const mapuri = "https://maps.app.goo.gl/2Dued4dsnuWnf8Ni8"
// await page.setViewport({width: 1080, height: 1080});
// // Navigate the page to a URL.

// await page.setRequestInterception(true);
// page.on('request', (req) => {
//   if(req.resourceType() === 'image') { req.abort();}
//   else { req.continue(); }
// });


// try {
//     await page.goto(mapuri);
// } catch (error) {
//     throw {name: "LINK_NOT_ACCESSIBLE", message: "There was a problem accessing the URL: " + mapUri}; 
// }

// await page.waitForNavigation({waitUntil: 'domcontentloaded'});
// // console.log("Took", Date.now() - mapstart, " ms to load the Google Maps DOM", mapuri);
// await page.waitForSelector(orderOnlineSelector);
// await page.click(orderOnlineSelector);
// await page.waitForNavigation({waitUntil: 'domcontentloaded'});

// // console.log("Took", Date.now() - mapstart, " ms to load the Google Maps DOM", mapuri);
// await page.waitForSelector(providerSelector);
// await page.click(providerSelector);
// await page.waitForNavigation({waitUntil: 'domcontentloaded'});
    

await page.goto("https://order.online/store/kotti-berliner-d%C3%B6ner-kebab-new-york-1362365/?hideModal=true&pickup=true&rwg_token=AJKvS9VQ9cjqlfSEkiGK-hwygnC8V3qdwboPXFWhm-xOihuJcwdu3ecHH3vwSLFzt_aINfemlVoMSV9eI3iWRhiOetNJc0A8AA==&utm_source=gfo");
await page.waitForNavigation({waitUntil: 'domcontentloaded'});

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

filterGFMenuItems(menuItems);
console.log(menuItems);
// console.log(items);


// await page.setViewport({width: 1080, height: page_height});

// await browser.close();