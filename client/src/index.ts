import GMap from './map/GMap';

declare global {
  interface Window {
    initMap: () => void;
  }
}

export {};

window.onload = updateMap;
window.initMap = GMap.initMap;
function updateMap() {
  window.initMap = GMap.initMap;
}
