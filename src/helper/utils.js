import * as constant from '../helper/constants';

import { Fill, Stroke, Style, Text } from "ol/style.js";
import toast from 'react-hot-toast';
import GeoJSON from 'ol/format/GeoJSON';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import Vector from "ol/source/Vector";
import VectorLayer from 'ol/layer/Vector';

import WebGLPointsLayer from 'ol/layer/WebGLPoints.js';

const colorMapping = {
  "Household Livelihood": 1, // Maroon
  "Others - HH, Community": 2, // Blue-Grey
  "Agri Impact - HH, Community": 3, // Yellow
  "SWC - Landscape level impact": 4, // Brown
  "Irrigation - Site level impact": 5, // Blue
  "Plantation": 6, // Green
  "Un Identified": 7, // Lavender
  "Default": 8, // Tan
};

const createTextStyle = (feature, resolution) => {
  try{
    return new Text({
      textAlign: 'center',
      textBaseline: 'middle',
      scale : 1.4,
      text: feature.values_.Panchaya_1.charAt(0).toUpperCase() + feature.values_.Panchaya_1.slice(1),
      fill: new Fill({color: '#ffffff'}),
      stroke: new Stroke({color: '#000000', width: 2}),
      offsetX: 0,
      offsetY: 0,
      overflow: true,
    });
  } catch(e){
    return new Text({
      textAlign: 'center',
      textBaseline: 'middle',
      scale : 1.4,
      text: feature.values_.vill_name.charAt(0).toUpperCase() + feature.values_.vill_name.slice(1),
      fill: new Fill({color: '#ffffff'}),
      stroke: new Stroke({color: '#000000', width: 2}),
      offsetX: 0,
      offsetY: 0,
      overflow: true,
    });
  }
}

const PanchayatBoundariesStyle = (feature, resolution) => {
  let nameStyle;
  try {
    nameStyle = new Style({
      stroke: new Stroke({
        color: "#292929",
        width: 2.0,
      }),
      fill: new Fill({
        color: "rgba(255, 255, 255, 0)",
      }),
      // text: createTextStyle(feature, resolution)
    });
  } catch (e) {
    nameStyle = new Style({
      stroke: new Stroke({
        color: "#292929",
        width: 2.0,
      }),
      fill: new Fill({
        color: "rgba(255, 255, 255, 0)",
      }),
    });
  }

  return nameStyle;
}

function getUrl(store_name, layer_name) {
  const geoserver_url = constant.GEOSERVER_URL;
  const geojson_url = geoserver_url + '/geoserver/' + store_name + '/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=' + store_name + ':' + layer_name + "&outputFormat=application/json&screen=main"
  return geojson_url;
}

function getNewUrl(store_name, resource_type, plan_id) {
  const geoserver_url = constant.GEOSERVER_URL;
  const dist = localStorage.getItem('dist_name').toLowerCase()
  const block = localStorage.getItem('block_name').toLowerCase()
  let geojson_url
  if (store_name !== "drainage" && store_name !== "customkml")
    geojson_url = geoserver_url + '/geoserver/' + store_name + '/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=' + store_name + '%3A' + resource_type + "_" + plan_id + "_" + dist + "_" + block + "&outputFormat=application/json&screen=main"

  else {
    geojson_url = geoserver_url + '/geoserver/' + store_name + '/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=' + store_name + '%3A' + dist + "_" + block + "&outputFormat=application/json&screen=main"
  }

  return geojson_url;
}

// with error handling
let errorReported = false;
function getVectorLayer(layer_store, layer_name, setVisible = true, setActive = true, resource_type = null, plan_id = null, temp_layer, setNregaYears) {
  let url


  if (plan_id == null)
    url = getUrl(layer_store, layer_name);
  else
    url = getNewUrl(layer_store, resource_type, plan_id)

  let nregaYears_temp = [];

  const vectorSource = new Vector({
    url: url,
    format: new GeoJSON(),
    loader: async function (extent, resolution, projection) {
      await fetch(url).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok for ' + layer_name);
        }
        return response.json();
      }).then(json => {
        vectorSource.addFeatures(vectorSource.getFormat().readFeatures(json).map((item) => {
          if (layer_store === "nrega_assets") {
            item.values_.itemColor = colorMapping[item.values_.WorkCatego] ? colorMapping[item.values_.WorkCatego] : colorMapping["Default"]

            let temp_year = new Date(Date.parse(item.values_.creation_t)).getFullYear()

            item.values_.workYear = temp_year.toString();
            //item.values_.workYear = temp_year;

            if (!nregaYears_temp.includes(temp_year)) {
              nregaYears_temp.push(temp_year);
              nregaYears_temp.sort();
            }
          }
          return item;
        }));
      }).catch(error => {
        if (!errorReported) {
          toast.error(`Failed to load the "${layer_name}" layer. Please check your connection or the map layer details.`, {
            duration: 6000,
            position: 'top-center',
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          });
          errorReported = true;
        }
      });
    }
  });

  let wmsLayer;

  if (layer_store === "nrega_assets") {
    const style = {
      filter: ['in', ['get', 'workYear'], [2016, 2017, 2018]],
      'shape-points': 10,
      'shape-radius': 13,
      'shape-fill-color': [
        'match',
        ['get', 'itemColor'],
        4,
        '#6495ED',
        '#00000000'
      ],
    }
    wmsLayer = new WebGLPointsLayer({
      source: vectorSource,
      style: style,
    })
    setNregaYears(nregaYears_temp);
  }
  else {
    wmsLayer = new VectorLayer({
      source: vectorSource,
      visible: setVisible,
      hover: setActive,
      myData: Math.random()
    });
  }
  if (layer_store == "panchayat_boundaries") {
    wmsLayer.setStyle(PanchayatBoundariesStyle);
  }

  return wmsLayer;
}

function calculateWaterBodyPercent(value_obj) {
  const sum_wb = value_obj.k_p_perc * 1 / 3 + value_obj.k_r_p_perc * 2 / 3 + value_obj.k_r_z_perc * 3 / 3
  return sum_wb;

}

function getImageLayer(layer_store, layer_name, setVisible = false) {
  const wmsLayer = new ImageLayer({
    source: new ImageWMS({
      url: 'https://geoserver.core-stack.org:8443/geoserver/wms',
      params: { 'LAYERS': layer_store + ':' + layer_name },
      ratio: 1,
      serverType: 'geoserver',
    }),
    visible: setVisible,
  })
  return wmsLayer;
}

function buildChartData(feature) {
  const data = [{ title: '% area of water under only Kharif', value: feature.k_p_perc, color: '#E38627' },
  { title: '% area of water under Kharif and rabi', value: feature.k_r_p_perc, color: '#C13C37' },
  { title: '% area of water under Rabi, Kharif and Zayed', value: feature.k_r_z_perc, color: '#6A2135' }
  ]
  return data
}

function getLayerName(url) {
  const url_array = url.split("/");
  return url_array[4];
}
function getOdkURLForScreen(screen_code, latlong, hemlet_id, well_id, block_name, wb_id, plan_id, plan_name, settlement_name, work_id, grid_id) {

  if (screen_code === "confirm_well") {
    const odk_url = constant[screen_code + '_odk_url'] + hemlet_id + "&d[/data/well_id]=" + well_id + "&d[/data/meta/instanceID]="
    return odk_url
  } else if (screen_code == "confirm_wb") {
    //console.log("confirm wb code");
    const odk_url = constant[screen_code + '_odk_url'] + hemlet_id + "&d[/data/waterbodies_id]=" + wb_id + "&d[/data/meta/instanceID]="
    return odk_url
  }


  // TODO: put agri info odk here

  // mapping hamlets to works
  else if (screen_code === "map_hamlet_agri") {
    const odk_url = constant[screen_code + '_odk_url'] + hemlet_id + "&d[/data/work_id]=" + plan_id + "&d[/data/meta/instanceID]="
    //console.log('odk url map agri: ',odk_url);
    return odk_url
  } else if (screen_code === "agri_irr_work") {
    const odk_url = constant[screen_code + '_odk_url'] + "&d[/data/GPS_point/point_mapsappearance]=" + latlong[1].toString() + "%20" + latlong[0].toString() + "&d[/data/block_name]=" + block_name + "&d[/data/plan_id]=" + plan_id + "&d[/data/plan_name]=" + plan_name + "&d[/data/meta/instanceID]="
    //console.log('odk url map agri irr work: ',odk_url); GPS_point-point_mapsappearance
    return odk_url
  }

  else if (screen_code === "map_hamlet_gw") {
    const odk_url = constant[screen_code + '_odk_url'] + hemlet_id + "&d[/data/work_id]=" + plan_id + "&d[/data/meta/instanceID]="
    //console.log('odk url map gw: ',odk_url);
    return odk_url
  }

  else if (screen_code === "map_hamlet_wb") {
    const odk_url = constant[screen_code + '_odk_url'] + hemlet_id + "&d[/data/work_id]=" + plan_id + "&d[/data/meta/instanceID]="
    //console.log('odk url map waterbodies: ',odk_url);
    return odk_url
  }

  else if (screen_code === "add_crop_info" || screen_code == "provide_info") {
    const odk_url = constant[screen_code + '_odk_url'] + hemlet_id + "&d[/data/crop_Grid_id]=" + grid_id + "&d[/data/beneficiary_settlement]=" + settlement_name + "&d[/data/plan_id]=" + plan_id + "&d[/data/plan_name]=" + plan_name + "&d[/data/meta/instanceID]="
    //console.log('odk url',odk_url);
    return odk_url
  }
  else if (screen_code === "add_hm") {
    const odk_url = constant[screen_code + '_odk_url'] + latlong[1].toString() + "%20" + latlong[0].toString() + "&d[/data/block_name]=" + block_name + "&d[/data/plan_id]=" + plan_id + "&d[/data/plan_name]=" + plan_name + "&d[/data/meta/instanceID]="
    //console.log(odk_url);
    return odk_url
  }
  else if (screen_code == "add_well" || screen_code == "add_wb") {
    const odk_url = constant[screen_code + '_odk_url'] + latlong[1].toString() + "%20" + latlong[0].toString() + "&d[/data/hamlet_id]=" + hemlet_id + "&d[/data/block_name]=" + block_name + "&d[/data/plan_id]=" + plan_id + "&d[/data/beneficiary_settlement]=" + settlement_name + "&d[/data/plan_name]=" + plan_name + "&d[/data/meta/instanceID]="
    return odk_url
  }
  else if (screen_code == "confirm_crop") {
    const odk_url = constant[screen_code + '_odk_url'] + hemlet_id + "&d[/data/Crop_Grid_id]=" + grid_id + "&d[/data/plan_id]=" + plan_id + "&d[/data/plan_name]=" + plan_name + "&d[/data/meta/instanceID]="
    console.log(odk_url);
    return odk_url
  }
  else if (screen_code == "feedback_agri" || screen_code == "feedback_wb" || screen_code == "feedback_gw") {
    const odk_url = constant[screen_code + '_odk_url'] + "&d[/data/meta/instanceID]="
    //console.log(odk_url);
    return odk_url
  }
  else if (screen_code == "add_livelihood") {
    const odk_url = constant[screen_code + '_odk_url'] + latlong[1].toString() + "%20" + latlong[0].toString() + "&d[/data/block_name]=" + block_name + "&d[/data/plan_id]=" + plan_id + "&d[/data/plan_name]=" + plan_name + "&d[/data/beneficiary_settlement]=" + settlement_name + "&d[/data/meta/instanceID]="
    return odk_url
  }
  else if (screen_code == "propose_maintenance_agri_irrigation") {
    const odk_url = constant[screen_code + '_odk_url'] + "&d[/data/GPS_point/point_mapsappearance]=" + latlong[1].toString() + "%20" + latlong[0].toString() + "&d[/data/plan_id]=" + plan_id + "&d[/data/plan_name]=" + plan_name + "&d[/data/corresponding_work_id]=" + work_id + "&d[/data/block_name]=" + block_name + "&d[/data/meta/instanceID]="
    return odk_url
  }
  else if (screen_code == "propose_maintenance_groundwater") {
    console.log(work_id)
    const odk_url = constant[screen_code + '_odk_url'] + latlong[1].toString() + "%20" + latlong[0].toString() + "&d[/data/block_name]=" + block_name + "&d[/data/plan_id]=" + plan_id + "&d[/data/plan_name]=" + plan_name + "&d[/data/corresponding_work_id]=" + work_id + "&d[/data/meta/instanceID]="
    return odk_url
  }
  else {
    const odk_url = constant[screen_code + '_odk_url'] + latlong[1].toString() + "%20" + latlong[0].toString() + "&d[/data/block_name]=" + block_name + "&d[/data/plan_id]=" + plan_id + "&d[/data/plan_name]=" + plan_name + "&d[/data/corresponding_work_id]=" + work_id + "&d[/data/meta/instanceID]="
    //console.log(odk_url);
    return odk_url
  }
}


export { getUrl, getVectorLayer, calculateWaterBodyPercent, getImageLayer, buildChartData, getLayerName, getOdkURLForScreen };