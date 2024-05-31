// Regex pattern for finding "GF", "gluten*free" (case-insensitive, * can be anything, for variations in hyphens, spaces, etc.)
const GF_PATTERN = /\bGF\b|gluten[^a-zA-Z0-9]free/i;

let mentionsGlutenFree = (string) => {
   return string.search(GF_PATTERN);
}

/**
 * @param {String|Array} menuItems An array of food items (name, price, description); each descriptor is separated by a newline
 * @returns A JSON of food items labeled Gluten-Free or mentioning Gluten-Free in their description
 */
let filterGFMenuItems = (menuItems) => {
   // Validate input (ie. no null or empty lists)
   if (!Array.isArray(menuItems) || menuItems.length == 0) { 
      return []; 
   }
   
   // menuItems.forEach(element => {
   //    console.log(element + " " + mentionsGlutenFree(element));
   // });
   menuItems = menuItems.filter((item) => mentionsGlutenFree(item) > -1);
   console.log(menuItems);
}

module.exports = { filterGFMenuItems };