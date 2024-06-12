// Request needed libraries.
//@ts-ignore
const { Map } = await google.maps.importLibrary("maps");
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

// Initialize and add the map
let map;
const position = { lat: 40.7174, lng: -73.985 };

async function initMap() {
  // The location of Uluru

  // The map, centered at Uluru
  map = new Map(document.getElementById("map"), {
    zoom: 15,
    minZoom: zoom - 1,
    maxZoom: zoom + 2,
    center: position,
    mapTypeControl: false,
    mapId: "DEMO_MAP_ID",
  });

  }

initMap();

let marker = (resName, resLat, resLong) => {
  let tag = document.createElement("div");

  tag.className = "gf-tag";
  tag.textContent = resName;

  return new AdvancedMarkerElement({
    map: map,
    position: { lat: resLat, lng: resLong },
    content: tag
  });
}
export { marker };