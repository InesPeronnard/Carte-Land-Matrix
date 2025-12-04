import './style.css';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import ScaleLine from 'ol/control/ScaleLine.js';
import {defaults as defaultControls} from 'ol/control/defaults.js';

import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';

import Style from 'ol/style/Style.js';
import CircleStyle from 'ol/style/Circle.js';
import Fill from 'ol/style/Fill.js';

import GeoJSON from 'ol/format/GeoJSON.js';

import TileLayer from 'ol/layer/Tile.js';
import {fromLonLat} from 'ol/proj.js';
import StadiaMaps from 'ol/source/StadiaMaps.js';

const map = new Map({
  layers: [
    new TileLayer({
      source: new StadiaMaps({
        layer: 'stamen_toner',
      }),
    }),
    new TileLayer({
      source: new StadiaMaps({
        layer: 'stamen_toner_labels',
      }),
    }),
  ],
  target: 'map',
  view: new View({
    projection: 'EPSG:4326',
    center: [0, 0],
    zoom: 2,
  }),
});


const dealsLayers = new VectorLayer({
  title : 'deals',
  source : new VectorSource({
    url :'/geoserver/opt/data/deals.geojson',
    format : new GeoJSON(),
  }),
  style : new Style({
    image : new CircleStyle({
      radius : 3, 
      fill : new Fill ({color : 'orange' })
    })
  })
});

map.addLayer(dealsLayers);
