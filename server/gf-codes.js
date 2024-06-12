// gf-codes.js defines constants used for ranking the GF options at a given restauarant

const SELF_DESCRIBED_GF = 3;
const HAS_GF_ITEMS = 2;
const COMMENTS_MENTION_GF = 1;
const NO_MENTION_GF = 0;
const MENU_NOT_ACCESSIBLE = -1;
const LINK_INACCESSIBLE = -2;

let isError = (resJSON) => {
   return resJSON.gfRank < 0;
}

let voidExceptID = (resJSON) => {
   let voided = resFormat(resJSON.id, null, null, null, null);
   voided.gfRank = resJSON.gfRank;
   return voided;
}

const resFormat = (id, mapUri, lat, long, name) => {
   return  {
      "id" : id,
      "name" : name,
      "lat" : lat,
      "long": long,
      "mapUri" : mapUri,
      "gfSum" : "",
      "gfRank" : 0, 
      "gfReviews" : [],
      "gfItems" : [],
      "resolveAttempts" : 0
   };
}

export {resFormat, SELF_DESCRIBED_GF, HAS_GF_ITEMS, COMMENTS_MENTION_GF, 
   NO_MENTION_GF, MENU_NOT_ACCESSIBLE, LINK_INACCESSIBLE, isError, voidExceptID };