import { divIcon, tileLayer } from 'leaflet';

export const leafletOptions = {
  layers: [
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }),
  ],
};

export const pointIcon = divIcon({
  iconSize: [18, 18],
  html: '',
});

export const polygonOptions = {
  fillOpacity: 0.5,
  fillColor: '#3f51b5',
};
