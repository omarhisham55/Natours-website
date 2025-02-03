export const displayMap = (locations) => {
  const map = L.map("map", {
    zoomControl: false,
    // boxZoom: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    maxZoom: 6,
    minZoom: 6,
  });

  // Add a tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  }).addTo(map);

  const bounds = L.latLngBounds();

  // Add a marker
  locations.forEach((loc) => {
    //: Create marker
    const icon = L.divIcon({
      className: "marker",
      iconSize: [28, 35],
      html: document.createElement("div"),
    });

    //: Add marker
    const marker = L.marker(loc.coordinates.reverse(), { icon }).addTo(map);
    marker.bindPopup(`Day ${loc.day}: ${loc.description}`).openPopup();

    bounds.extend(marker.getLatLng());
  });

  map.fitBounds(bounds);
};
