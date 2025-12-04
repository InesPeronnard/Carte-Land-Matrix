import './style.css';
import {Map, View} from 'ol';
import ImageLayer from 'ol/layer/Image';
import TileLayer from 'ol/layer/Tile';
import { ImageWMS } from 'ol/source';
import OSM from 'ol/source/OSM';

const CoucheOsm = new TileLayer ({source : new OSM()});

const MaSource = new ImageWMS({
  url : 'https://ahocevar.com/geoserver/wms',
  params : {'LAYERS': 'topp:states'},
  serverType : 'geoserver',
})

const MaCouche = new ImageLayer({
  source : MaSource, 
})

const map = new Map({
  target: 'map',
  layers: [ CoucheOsm, MaCouche],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});
console.log("Hola");