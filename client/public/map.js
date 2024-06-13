// Request needed libraries.
const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
  google.maps.importLibrary("marker"),
  google.maps.importLibrary("places"),
]);

const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
placeAutocomplete.id = "place-autocomplete-input";

// Initialize and add the map
let map;
const position = { lat: 40.7174, lng: -73.985 };

async function initMap() {
  // The location of Uluru

  // The map, centered at Uluru
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 18,
    minZoom: 17,
    maxZoom: 18,
    center: position,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    mapId: "map-id",
  });

  // Add default marker
  let locator = new google.maps.marker.AdvancedMarkerElement({ map });

  const searchContainer = document.getElementById("search-container");
  searchContainer.appendChild(placeAutocomplete);

  placeAutocomplete.addEventListener("gmp-placeselect", async ({ place }) => {
    await place.fetchFields({
      fields: ["displayName", "formattedAddress", "location"],
    });
    // If the place has a geometry, then present it on a map.
    if (place.viewport) {
      map.fitBounds(place.viewport);
    } else {
      map.setCenter(place.location);
      map.setZoom(18);
    }
    
    locator.position = place.location;
  });


}

initMap();

let marker = (resName, resLat, resLong) => {
  let tag = document.createElement("div");

  tag.className = "gf-tag";
  tag.textContent = resName;

  return new google.maps.marker.AdvancedMarkerElement({
    map: map,
    position: new google.maps.LatLng(resLat, resLong),
    content: tag
  });
}

export { marker, map };