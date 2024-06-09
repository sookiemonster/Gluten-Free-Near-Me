// parse-gluten-free.js defines the routines for checking whether a string / array of strings mentions gluten-free (or related keywords)

// Regex pattern for finding "GF", "gluten*free" (case-insensitive, * can be anything, for variations in hyphens, spaces, etc.)
const GF_PATTERN = /\bGF\b|gluten[^a-zA-Z0-9]free\b|celiac/i;

/**
 * 
 * @param {String} string Any string to search for gluten-free
 * @returns True if the provided string mentions GF, gluten-free, gluten free, etc.
 */
let mentionsGlutenFree = (string) => {
   if (string == undefined || string == null || typeof string != 'string' && !string instanceof String) {
      return false;
   }
   return string.search(GF_PATTERN) > -1;
}

/**
 * Removes all strings that don't mention gluten free
 * @param {String|Array} menuItems An array of strings that represent food items (name\n price\n description\n)
 */
let filterGFMenuItems = (menuItems) => {
   // Validate input (ie. no non-lists)
   if (!Array.isArray(menuItems)) { 
      return []; 
   }

   let index = 0;
   while (index < menuItems.length) {
      if (mentionsGlutenFree(menuItems[index])) {
         // Skip over the current element
         index++;
      } else {
         // No mention of GF so we replace with the back and pop the duplicate
         menuItems[index] = menuItems[menuItems.length - 1];
         menuItems.length--;
      }
   }
}

export { mentionsGlutenFree, filterGFMenuItems };