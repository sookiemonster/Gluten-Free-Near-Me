let isNear = (place, point) => {
   
}

let filterFoci = (searchFoci, places) => {
   let filtered = [];
   for (point of searchFoci) {
      let focusNearby = false;

      for (place of places) {
         if (isNear(place, point)) {
            focusNearby = true;
            break;
         }
      }

      if (!focusNearby) { filtered.push(point); }
   }

   return filtered;
}