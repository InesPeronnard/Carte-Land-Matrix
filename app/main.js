import './style.css';
import {Map, View} from 'ol';
import ImageLayer from 'ol/layer/Image';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { ImageWMS } from 'ol/source';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import {Circle, Fill, Stroke, Style} from 'ol/style.js';
import { toLonLat } from 'ol/proj';
import ScaleLine from 'ol/control/ScaleLine.js';

const geoserver = 'http://localhost:8080/geoserver/land_matrix/'

const CoucheOsm = new TileLayer ({source : new OSM()});

// importation de ma couche source au format image des Deals
const MaSource = new ImageWMS({
  url : geoserver + 'wms',
  params : {
    'LAYERS': 'land_matrix:deals',
    //"CQL_FILTER": "gold = 'true'",
  },
  serverType : 'geoserver',
})

// Crée ma couche MaCouche
const MaCouche = new ImageLayer({
  source : MaSource, 
})

// importation de ma couche source au format vecteurs des Deals centroide par rapport a la surface
const sourceSurface = new VectorSource ({
  format : new GeoJSON(),
  url : geoserver + 'ows?service=WFS&version=1.0.0&request=GetFeature&typeName=land_matrix%3Adeals_by_country_centroid&maxFeatures=50&outputFormat=application%2Fjson',
})

// Création d'une fonction pour définir les propriétait de mes cercles et de la symbologie par rapport à la surface
function getStyleSurface (feature) {
  const sDeals = feature.get('suface_ha');
  const rayons = Math.sqrt(sDeals)* 0.06;
  const styles = new Style ({
    image: new Circle ({
      radius : rayons, 
      fill: new Fill ({color: "rgba(66, 162, 214, 0.6)"  }), 
      stroke : new Stroke ({color : 'rgba(49, 129, 181)', width : 2
      })
    })
  })
  return styles;
}

const layersurface =new VectorLayer({
  source: sourceSurface,
  style: getStyleSurface,
})


const sourceCentroid = new VectorSource ({
  format : new GeoJSON(),
  url : geoserver + 'ows?service=WFS&version=1.0.0&request=GetFeature&typeName=land_matrix%3Adeals_by_country_centroid&maxFeatures=50&outputFormat=application%2Fjson',
})

// Création d'une fonction pour définir les propriétait de mes cercles et de la symbologie par rapport à la surface
function getStyleCentroid(feature) {
  const nDeals = feature.get('n_deals');
  const rayon = Math.sqrt(nDeals)* 8;
  const style = new Style ({
    image: new Circle ({
      radius : rayon, 
      fill: new Fill ({color: "rgba(212, 114, 21, 0.6)"  }), 
      stroke : new Stroke ({color : "rgba(179, 93, 12)", width : 2
      })
    })
  })
  return style;
}

const layerCentroid =new VectorLayer({
  source: sourceCentroid,
  style: getStyleCentroid,
})

const Echelle = new ScaleLine();

const map = new Map({
  target: 'map',
  layers: [ CoucheOsm, MaCouche, layerCentroid, layersurface],
  controls: [Echelle],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});


// permettre par un click de renvoyée des coordonées
// map.on('singleclick', function (evt) {
//   console.log(toLonLat(evt.coordinate));
// });

// interoger une couche WMS
map.on('singleclick', (event) => {
  const coord = event.coordinate;
  const res = map.getView().getResolution();
  const proj = 'EPSG:3857';
  const parametres = {'INFO_FORMAT': 'application/json'};

  const url = MaSource.getFeatureInfoUrl(coord, res, proj, parametres);

  if (url) {
    fetch(url)
      .then((response) => response.text())
      .then((json) => {
        const obj = JSON.parse(json);
        if (obj.features[0]) {
          console.log("J’ai cliqué sur une feature !");
          const properties = obj.features[0].properties;
          console.log(properties);
          // On affiche deal_id dans notre table
          document.getElementById('table-deal-id').innerHTML = properties.deal_id;
          document.getElementById('table-creation-date').innerHTML = properties.created_at;
          document.getElementById('table-country').innerHTML = properties.target_country;
          document.getElementById('table-resources-minéral').innerHTML = properties.mineral_resources;
        } else {
          console.log("J’ai cliqué à côté…");
          // On a cliqué "nulle part" donc on remet des … dans la colonne "deal_id"
          document.getElementById('table-deal-id').innerHTML = "";
          document.getElementById('table-creation-date').innerHTML = "";
          document.getElementById('table-country').innerHTML = "";
          document.getElementById('table-resources-minéral').innerHTML = "";
        }
      });
  }
});


// Définir le titre à ma carte
const title = document.getElementById("title");

// Crée un bouton pour changer la couleur du titre avec un click sur le bouton
const button = document.getElementById("bouton");

// function titreorange() {
//   title.style.color = "orange";
// }

// button.addEventListener('click', titreorange);

// permettre au bouton de supprimer la couche Macouche par un "click"
button.addEventListener('click', function () {
  map.removeLayer(MaCouche);
});

// Création d'une checkbox pour les deals bycontry
const checkboxCountries = document.getElementById('checkbox-countries');

checkboxCountries.addEventListener('change', (event) => {
  if (event.currentTarget.checked) {
    // On fait des trucs quand la checkbox est checkée
    layerCentroid.setVisible(true);
  } else {
    // On fait des trucs quand la checkbox n’est PAS checkée
    layerCentroid.setVisible(false);
  }
});

//Création d'une checkbox pour les deals
const checkboxdeals = document.getElementById('checkbox-deals');

checkboxdeals.addEventListener('change', (event) => {
  if (event.currentTarget.checked) {
    // On fait des trucs quand la checkbox est checkée
    MaCouche.setVisible(true);
  } else {
    // On fait des trucs quand la checkbox n’est PAS checkée
    MaCouche.setVisible(false);
  }
});

// Filtrer des couches WMS
// Or
const buttonGold = document.getElementById('button-gold');

buttonGold.addEventListener('change', () => {
  MaSource.updateParams({ 'CQL_FILTER' : 'gold=true' });
});

// Argent
const buttonSilver = document.getElementById('button-silver');
buttonSilver.addEventListener('change', () => {
  MaSource.updateParams({ 'CQL_FILTER' : 'silver=true' });
});

// Charbon
const buttoncharbon = document.getElementById('button-charbon');
buttoncharbon.addEventListener('change', () => {
  MaSource.updateParams({ 'CQL_FILTER' : 'coal=true' });
});

// lithium
const buttonlithium = document.getElementById('button-lithium');
buttonlithium.addEventListener('change', () => {
  MaSource.updateParams({ 'CQL_FILTER' : 'lithium=true' });
});

// cobalt
const buttoncobalt = document.getElementById('button-cobalt');
buttoncobalt.addEventListener('change', () => {
  MaSource.updateParams({ 'CQL_FILTER' : 'cobalt=true' });
});

// tous
const buttontous = document.getElementById('button-tous');
buttontous.addEventListener('change', () => {
  MaSource.updateParams({ 'CQL_FILTER' : '' });
});
