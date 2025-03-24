import "ol/ol.css";
import "ol-ext/dist/ol-ext.css";
import styles from "./MainMap.module.css";
import "intro.js/introjs.css";

import * as extent from "ol/extent";
import * as proj from "ol/proj";

import { Circle as CircleStyle, Fill, Stroke, Icon } from "ol/style.js";
import { Feature, Map, View, Geolocation } from "ol";

import React, { useEffect, useRef, useState } from "react";

import {
  faCompass,
  faCrosshairs,
  faInfoCircle,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

import InfoModal from "../info/infoModal";
import { Point } from "ol/geom";
import NregaInfoBox from "../info/AssetInfoBox.js";
import { Style } from "ol/style.js";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import WebGLPointsLayer from 'ol/layer/WebGLPoints.js';

import XYZ from "ol/source/XYZ";
import { getVectorLayer } from "../helper/utils";
import { useNavigate } from "react-router-dom";

//** Material UI Imports **/
import Button from "../components/Button.js";
import { styled } from "@mui/material/styles";
import { purple } from '@mui/material/colors';
import { alpha } from '@mui/material/styles';
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

import Loader from "../info/loader";

//? Hooks Store Imports
import useMapLayers from "../hooks/useMapLayers.js";
import usePlansStore from "../hooks/usePlans.js";
import useOdkModal from "../hooks/useOdkModal.js";
import useLayersModal from "../hooks/useLayersModal.js";

import toast, { Toaster } from "react-hot-toast";
import Modal from "../components/Modal.js";

import planIds from "../default_plan.json";
import MenuSimple from "../components/MenuSimple.js";
import LayersBottomSheet from "../components/LayersBottomSheet.js";

//? Icons Import For Resources
import settlementIcon from "../asset/settlement_icon.svg";
import well_mrker from "../asset/well_proposed.svg";
import well_mrker_accepted from "../asset/well_accepted.svg";
import well_mrker_rejected from "../asset/well_rejected.svg";

import wb_mrker from "../asset/waterbodies_proposed.svg";
import boulder_proposed from "../asset/boulder_proposed.svg";
import farm_pond_proposed from "../asset/farm_pond_proposed.svg";
import tcb_proposed from "../asset/tcb_proposed.svg";
import canals_proposed from "../asset/canal_proposed.svg";
import checkDam_proposed from "../asset/check_dam_proposed.svg";
import useNregaYears from "../hooks/useNregaYears.js";

import { useTranslation } from 'react-i18next';

function MainMap({ setScreenTitle, setScreenIcon, setGpsLocationMain }) {
  const mapElement = useRef();
  const mapRef = useRef();

  const osmLayerRef = useRef(null);
  const adminLayerRef = useRef(null);
  const nregaLayerRef = useRef(null);
  const positionFeatureRef = useRef(null);
  const kmlLayerRef = useRef(null);
  const SettlementLayerRef = useRef(null);
  const WellLayerRef = useRef(null);
  const WaterStructureLayerRef = useRef(null);

  const [showNregaDropdown, setShowNregaDropdown] = useState(false);
  const [nregaWorks, setNregaWorks] = useState([
    "SWC - Landscape level impact",
  ]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [isInBlock, setIsInBlock] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [infoBoxType, setInfoBoxType] = useState(null);

  const [activeYears, setActiveYears] = useState([2016, 2017, 2018]);

  const [planningState, setPlanningState] = useState(false);

  const LayerStore = useMapLayers((state) => state);

  const { t } = useTranslation();

  const { currentPlan, setFocusTrigger, zoomLevel, mapCenter, setZoomLevel, setMapCenter } = usePlansStore((state) => {
    return {
      currentPlan: state.currentPlan,
      setFocusTrigger: state.setFocusTrigger,
      zoomLevel: state.zoomLevel,
      mapCenter: state.mapCenter,
      setZoomLevel: state.setZoomLevel,
      setMapCenter: state.setMapCenter
    };
  });

  const onOpenLayers = useLayersModal((state) => state.onOpen);

  const updateSettlementName = useOdkModal(
    (state) => state.updateSettlementName
  );

  const nregaYears = useNregaYears((state) => state.nregaYears);
  const setNregaYears = useNregaYears((state) => state.setNregaYears);

  //? Year Switch Component
  const PurpleSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: purple[700],
      '&:hover': {
        backgroundColor: alpha(purple[700], theme.palette.action.hoverOpacity),
      },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: purple[700],
    },
  }));

  // NREGA works
  const works = [
    "Agri Impact - HH, Community",
    "Household Livelihood",
    "Irrigation - Site level impact",
    "Plantation",
    "SWC - Landscape level impact",
    "Others - HH, Community",
    "Un Identified",
  ];

  // Proper name mappings for NREGA works
  const properWorkNames = [
    t("Land Restoration"),
    t("Off-farm livelihood assets"),
    t("Irrigation on farms"),
    t("Plantations"),
    t("Soil and Water Conservation"),
    t("Community assets"),
    t("Unidentified"),
  ];

  // Work to color mapping
  const workToNumMapping = {
    "Household Livelihood": 1, // Maroon
    "Others - HH, Community": 2, // Blue-Grey
    "Agri Impact - HH, Community": 3, // Yellow
    "SWC - Landscape level impact": 4, // Brown
    "Irrigation - Site level impact": 5, // Blue
    "Plantation": 6, // Green
    "Un Identified": 7, // Lavender
    "Default": 8, // Tan
  };

  const workToColorMapping = {
    "Household Livelihood": "#C2678D", // Maroon
    "Others - HH, Community": "#355070", // Blue-Grey
    "Agri Impact - HH, Community": "#FFA500", // Yellow
    "SWC - Landscape level impact": "#6495ED", // Brown
    "Irrigation - Site level impact": "#1A759F", // Blue
    "Plantation": "#52B69A", // Green
    "Un Identified": "#6D597A", // Lavender
    "Default": "#EAAC8B", // Tan
  }

  const buttonColorMapping = {
    "Household Livelihood": [194, 103, 141, 0.7], // Maroon
    "Others - HH, Community": [53, 80, 112, 0.7], // Blue-Grey
    "Agri Impact - HH, Community": [255, 165, 0, 0.7], // Yellow
    "SWC - Landscape level impact": [100, 149, 237, 0.7], // Brown
    "Irrigation - Site level impact": [26, 117, 159, 0.7], // Blue
    "Plantation": [82, 182, 154, 0.7], // Green
    "Un Identified": [109, 89, 122, 0.7], // Lavender
    Default: [234, 172, 139, 0.7], // Tan
  }

  const [nregaStyle, setNregaStyle] = useState({
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
  })

  const navigate = useNavigate();

  // to show the info button on the main screen
  const handleInfoClick = () => {
    setShowInfoModal(true);
  };

  const handleInfoClose = () => {
    setShowInfoModal(false);
  };

  const handleNregaButtonClick = () => {
    setShowNregaDropdown(!showNregaDropdown);
  };

  const handleGroundWaterButtonClick = () => {
    var arr = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
    setMapCenter([(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2])
    const url =
      "/water?geoserver_url=" +
      localStorage.getItem("geoserver_url") +
      "&block_pkey=" +
      localStorage.getItem("block_pkey") +
      "&app_name=" +
      localStorage.getItem("app_name") +
      "&dist_name=" +
      localStorage.getItem("dist_name") +
      "&block_name=" +
      localStorage.getItem("block_name");
    navigate(url);
  };

  const handleWaterBodiesButtonClick = () => {
    var arr = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
    setMapCenter([(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2])
    const url =
      "/waterbodies?geoserver_url=" +
      localStorage.getItem("geoserver_url") +
      "&block_pkey=" +
      localStorage.getItem("block_pkey") +
      "&app_name=" +
      localStorage.getItem("app_name") +
      "&dist_name=" +
      localStorage.getItem("dist_name") +
      "&block_name=" +
      localStorage.getItem("block_name");
    navigate(url);
  };

  const handleSmButtonClick = () => {
    if (currentPlan !== null) {
      setFocusTrigger(false);
      // let tempSource = adminLayerRef.current.getSource()
      // let arr = tempSource.getExtent();
      // 
      var arr = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
      setMapCenter([(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2])
      const url =
        "/socialmapping?geoserver_url=" +
        localStorage.getItem("geoserver_url") +
        "&block_pkey=" +
        localStorage.getItem("block_pkey") +
        "&app_name=" +
        localStorage.getItem("app_name") +
        "&dist_name=" +
        localStorage.getItem("dist_name") +
        "&block_name=" +
        localStorage.getItem("block_name");
      navigate(url);
    } else {
      toast.error("First, select a plan!");
      setFocusTrigger(true);
    }
  };

  const handleAgriButtonClick = () => {
    var arr = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
    setMapCenter([(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2])
    const url =
      "/agri?geoserver_url=" +
      localStorage.getItem("geoserver_url") +
      "&block_pkey=" +
      localStorage.getItem("block_pkey") +
      "&app_name=" +
      localStorage.getItem("app_name") +
      "&dist_name=" +
      localStorage.getItem("dist_name") +
      "&block_name=" +
      localStorage.getItem("block_name");
    navigate(url);
  };

  const handleLivelihoodButtonClick = () => {
    var arr = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
    setMapCenter([(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2])
    const url =
      "/livelihood?geoserver_url=" +
      localStorage.getItem("geoserver_url") +
      "&block_pkey=" +
      localStorage.getItem("block_pkey") +
      "&app_name=" +
      localStorage.getItem("app_name") +
      "&dist_name=" +
      localStorage.getItem("dist_name") +
      "&block_name=" +
      localStorage.getItem("block_name");
    navigate(url);
  };

  const handleForestButtonClick = () => {
    var arr = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
    setMapCenter([(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2])
    const url =
      "/forest?&block_pkey=" +
      localStorage.getItem("block_pkey") +
      "&app_name=" +
      localStorage.getItem("app_name") +
      "&dist_name=" +
      localStorage.getItem("dist_name") +
      "&block_name=" +
      localStorage.getItem("block_name");
    navigate(url);
  }

  // MARK: Query Params
  //Grabbing info from the URL
  const queryParameters = new URLSearchParams(window.location.search);
  localStorage.setItem("app_name", queryParameters.get("app_name"));
  localStorage.setItem("dist_name", queryParameters.get("dist_name").replace(/ /g, "_"));
  localStorage.setItem("block_name", queryParameters.get("block_name").replace(/ /g, "_"));
  localStorage.setItem(
    "plan_id",
    planIds[queryParameters.get("block_name").toLowerCase()]
  );

  // check if block_id exists in the query params and then set in localStorage
  if (queryParameters.get("block_id")) {
    localStorage.setItem("block_id", queryParameters.get("block_id"));
  }

  useEffect(() => {
    setScreenTitle(localStorage.getItem("block_name"));
    setScreenIcon(null);
    updateSettlementName(null);
    LayerStore.resetLayersState();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGpsLocation([longitude, latitude]);
          setGpsLocationMain([longitude, latitude]);
        },
        (error) => {
          console.error("Error accessing geolocation:", error);
        }
      );
    } else {
      console.error("Geolocation is not available in this browser.");
    }

    setIsLoading(false);
  }, []);

  //Fetching the layers
  useEffect(() => {
    let BaseLayer = null;
    let NregaLayer = null;
    let EquityLayer = null;
    let AdminLayer = null;

    //? fetching Layers
    BaseLayer = new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        maxZoom: 30,
      }),
      visible: true,
    });

    NregaLayer = getVectorLayer(
      "nrega_assets",
      localStorage.getItem("dist_name").toLowerCase() +
      "_" +
      localStorage.getItem("block_name").toLowerCase(),
      true,
      true,
      null,
      null,
      null,
      setNregaYears
    );

    AdminLayer = getVectorLayer(
      "panchayat_boundaries",
      localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase(),
      true,
      false
    );

    EquityLayer = getVectorLayer(
      "equity",
      localStorage.getItem("block_name").toLowerCase() + "_equity",
      true,
      true
    );

    //? Styling Of the fetched layers
    EquityLayer.setStyle(
      new Style({
        stroke: new Stroke({
          color: "#f00",
          width: 1.5,
        }),
        fill: new Fill({
          color: "rgba(0, 0, 0, 0)", // Fully opaque black
        }),
      })
    );

    const positionFeature = new Feature({
      // geometry: new Point([78.9, 20.5]),
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: "#3399CC",
          }),
          stroke: new Stroke({
            color: "#3399CC",
            width: 5,
          }),
        }),
      }),
      visible: true,
    });

    osmLayerRef.current = BaseLayer;
    adminLayerRef.current = AdminLayer;
    nregaLayerRef.current = NregaLayer;
    positionFeatureRef.current = positionFeature;

    positionFeatureRef.current.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({
            color: "#3399CC",
          }),
          stroke: new Stroke({
            color: "#fff",
            width: 3,
          }),
        }),
      })
    );

    const view = new View({
      center: [78.9, 20.5],
      zoom: zoomLevel !== null ? zoomLevel : 11,
      projection: "EPSG:4326",
      multiWorld: true,
    });

    const initialMap = new Map({
      target: mapElement.current,
      layers: [BaseLayer, AdminLayer, NregaLayer],
      view: view,
    });

    mapRef.current = initialMap;

    mapRef.current.on("click", (e) => {
      setShowNregaDropdown(false);

      const features = mapRef.current.getFeaturesAtPixel(e.pixel, {
        layerFilter: (layer) => layer === nregaLayerRef.current,
      });

      if (features.length > 0) {
        setSelectedFeatures(features);
        setInfoBoxType("nrega")
        setShowBottomSheet(true);
      }
    });

    //? Code for retaining Zoom levels
    mapRef.current.on('moveend', (e) => {
      let newZoom = mapRef.current.getView().getZoom()
      setZoomLevel(newZoom)
    })

    //? Centering the map to the selected block
    const Vectorsource = AdminLayer.getSource();
    Vectorsource.once("change", function (e) {
      if (Vectorsource.getState() === "ready") {
        if (mapCenter === null) {
          const arr = Vectorsource.getExtent();
          const mapcenter = [(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2];
          initialMap.getView().setZoom(13);
          initialMap.getView().setCenter(mapcenter);
        }
        else {
          initialMap.getView().setZoom(zoomLevel);
          initialMap.getView().setCenter(mapCenter);
        }
      }
    });

    //? Code Block for GPS
    const accuracyFeature = new Feature();

    const geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: view.getProjection(),
    });

    geolocation.on("change:accuracyGeometry", function () {
      accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });

    geolocation.on("change", function () {
      const coordinates = geolocation.getPosition();
      setGpsLocation(coordinates);
      const accuracy = geolocation.getAccuracy();
      positionFeatureRef.current.setGeometry(
        coordinates ? new Point(coordinates) : null
      );
    });

    geolocation.setTracking(true);

    new VectorLayer({
      map: initialMap,
      source: new VectorSource({
        features: [accuracyFeature, positionFeature],
      }),
    });

    if (adminLayerRef.current) {
      LayerStore.addLayersState("Admin Boundary", adminLayerRef, LayerStore.Layers);
    }

    if (nregaLayerRef.current) {
      LayerStore.addLayersState("NREGA Assets", nregaLayerRef, LayerStore.Layers);
    }

    if (SettlementLayerRef.current) {
      LayerStore.addLayersState("Settlement Layer", SettlementLayerRef, LayerStore.Layers);
    }

    if (WellLayerRef.current) {
      LayerStore.addLayersState("Well Layer", WellLayerRef, LayerStore.Layers);
    }

    if (WaterStructureLayerRef.current) {
      LayerStore.addLayersState("Water Structure Layer", WaterStructureLayerRef, LayerStore.Layers);
    }

    // Update the layers presence status if at least one layer is registered
    if (Object.keys(LayerStore.Layers).length > 0) {
      LayerStore.updateStatus(true);
    }

    setIsLoading(false);

    return () => {
      initialMap.setTarget(null);
    };
  }, []);

  useEffect(() => {
    if (currentPlan !== null) {

      if (SettlementLayerRef.current !== null) { mapRef.current.removeLayer(SettlementLayerRef.current) }
      if (WellLayerRef.current !== null) { mapRef.current.removeLayer(WellLayerRef.current) }
      if (WaterStructureLayerRef.current !== null) { mapRef.current.removeLayer(WaterStructureLayerRef.current) }

      LayerStore.updateCurrPlan(currentPlan)

      let SettlementLayer = null;
      let WaterStructureLayer = null;
      let WellLayer = null;

      SettlementLayer = getVectorLayer(
        "resources",
        "hemlet_layer" + localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "settlement",
        currentPlan.plan_id
      );

      WellLayer = getVectorLayer(
        "resources",
        "well_layer" + localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "well",
        currentPlan.plan_id
      );

      WaterStructureLayer = getVectorLayer(
        "resources",
        "wb_layer" + localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "waterbody",
        currentPlan.plan_id
      );

      SettlementLayer.setStyle(
        new Style({
          image: new Icon({ src: settlementIcon, scale: 0.4 }),
        })
      );

      WellLayer.setStyle(function (feature) {
        const status = feature.values_;
        if (status.status_re == "approved") {
          return new Style({
            image: new Icon({ src: well_mrker_accepted }),
          });
        } else if (status.status_re == "rejected") {
          return new Style({
            image: new Icon({ src: well_mrker_rejected }),
          });
        } else {
          return new Style({
            image: new Icon({ src: well_mrker }),
          });
        }
      });

      WaterStructureLayer.setStyle(function (feature) {
        const status = feature.values_;
        if (status.type_wbs == "Large water body") {
          return new Style({
            image: new Icon({ src: wb_mrker }),
          });
        } else if (status.type_wbs == "Farm pond") {
          return new Style({
            image: new Icon({ src: farm_pond_proposed }),
          });
        } else if (status.type_wbs == "Check dam") {
          return new Style({
            image: new Icon({ src: checkDam_proposed }),
          });
        } else if (status.type_wbs == "Loose boulder structure") {
          return new Style({
            image: new Icon({ src: boulder_proposed }),
          });
        } else if (status.type_wbs == "Trench cum bund network") {
          return new Style({
            image: new Icon({ src: tcb_proposed }),
          });
        } else if (status.type_wbs == "Canal") {
          return new Style({
            image: new Icon({ src: canals_proposed }),
          });
        } else if (status.type_wbs == "Irrigation channel") {
          return new Style({
            image: new Icon({ src: wb_mrker }),
          });
        } else {
          return new Style({
            image: new Icon({ src: wb_mrker }),
          });
        }
      });

      mapRef.current.addLayer(SettlementLayer)
      mapRef.current.addLayer(WellLayer)
      mapRef.current.addLayer(WaterStructureLayer)

      SettlementLayerRef.current = SettlementLayer
      WellLayerRef.current = WellLayer
      WaterStructureLayerRef.current = WaterStructureLayer

      mapRef.current.on("click", (e) => {
        setInfoBoxType(null)

        setShowNregaDropdown(false);

        const features = mapRef.current.getFeaturesAtPixel(e.pixel, {
          layerFilter: (layer) => layer === nregaLayerRef.current,
        });

        if (features.length > 0) {
          setSelectedFeatures(features);
          setInfoBoxType("nrega")
          setShowBottomSheet(true);
        }

        mapRef.current.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
          if (layer === SettlementLayer) {
            setSelectedFeatures(feature.values_)
            setInfoBoxType("settlement")
            setShowBottomSheet(true);
          }
          else if (layer === WellLayer) {
            setSelectedFeatures(feature.values_)
            setInfoBoxType("well")
            setShowBottomSheet(true);
          }
          else if (layer === WaterStructureLayer) {
            setSelectedFeatures(feature.values_)
            setInfoBoxType("waterStructure")
            setShowBottomSheet(true);
          }
        })
      });
    }
  }, [currentPlan])

  useEffect(() => {
    if (gpsLocation != null) {
      const blockExtent = adminLayerRef.current.getSource().getExtent(); // Get the extent of the active block
      const gpsCoordinate = proj.fromLonLat(gpsLocation);
      const isWithinExtent = extent.containsCoordinate(
        blockExtent,
        gpsLocation
      );

      if (isWithinExtent) {
        // Zoom to GPS location and adjust the view
        mapRef.current.getView().setCenter(gpsCoordinate);
        positionFeatureRef.current.setGeometry(new Point(gpsCoordinate));
        mapRef.current.getView().setZoom(13); // Adjust the zoom level as needed
      }
    }
  }, []);

  // For Custom KML Upload and Show in the Main map
  useEffect(() => {
    if (LayerStore.customKML) {
      let KMLlayer = getVectorLayer(
        "customkml",
        "KMl_layer" + localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "KMLlayer",
        currentPlan.plan_id
      );

      if (kmlLayerRef.current !== null)
        mapRef.current.removeLayer(kmlLayerRef.current);

      kmlLayerRef.current = KMLlayer;

      mapRef.current.addLayer(kmlLayerRef.current);

      LayerStore.setCustomKMLStatus();
    }
  }, [LayerStore.customKML]);

  const zoomToGPSLocation = () => {
    // For the time being, zooming to current location for testing
    // To zoom only within the extent of the block, remove the marked lines and uncomment the lines below it.
    try {
      if (mapRef.current && gpsLocation) {
        console.log(gpsLocation);
        mapRef.current.getView().setCenter(gpsLocation);
        mapRef.current.getView().setZoom(18); // remove after testing
      }
      const blockExtent = adminLayerRef.current.getSource().getExtent();
      const isWithinBlock = extent.containsCoordinate(blockExtent, gpsLocation);
      setIsInBlock(isWithinBlock);
    } catch (e) {
      toast.error("Getting Location !");
    }
  };

  const zoomToBlockExtents = () => {
    if (mapRef.current) {
      const blockExtent = adminLayerRef.current.getSource().getExtent(); // Get the extent of the active block
      const blockCenter = extent.getCenter(blockExtent);

      // Zoom to block extents
      mapRef.current.getView().setCenter(blockCenter);
      mapRef.current.getView().setZoom(13); // Adjust the zoom level as needed

      setIsInBlock(true);
    }
  };

  // Colour-coding NREGA works based on Work Category
  const handleWorksToggle = async (item) => {
    let checked = nregaWorks.includes(item);
    let temp_works
    if (!checked) {
      temp_works = [...nregaWorks];
      temp_works.push(item);
      setNregaWorks(temp_works);
    } else {
      temp_works = nregaWorks.filter((y) => y != item);
      setNregaWorks(temp_works);
    }

    let styleFillColor = ['match', ['get', 'itemColor']]

    temp_works.map((temp_item) => {
      styleFillColor.push(workToNumMapping[temp_item]);
      styleFillColor.push(workToColorMapping[temp_item]);
    })

    styleFillColor.push('#00000000')

    if (temp_works.length === 0) {
      styleFillColor = '#00000000'
    }

    let tempNregaStyle = {
      filter: nregaStyle.filter,
      'shape-points': nregaStyle['shape-points'],
      'shape-radius': nregaStyle['shape-radius'],
      'shape-fill-color': styleFillColor
    }


    setNregaStyle(tempNregaStyle);

    const nregaVectorSource = await nregaLayerRef.current.getSource();
    mapRef.current.removeLayer(nregaLayerRef.current);

    let nregaWebGlLayer = new WebGLPointsLayer({
      source: nregaVectorSource,
      style: tempNregaStyle,
    })

    nregaLayerRef.current = nregaWebGlLayer;

    mapRef.current.addLayer(nregaWebGlLayer)
  };

  const handleNregaYearToggle = async (temp_year) => {
    let temp_active_years = []
    if (activeYears.includes(temp_year)) {
      temp_active_years = activeYears.filter((year) => year != temp_year);
      setActiveYears(temp_active_years);
    } else {
      temp_active_years = [...activeYears];
      temp_active_years.push(temp_year);
      setActiveYears(temp_active_years);
    }

    let tempFilter = ['in', ['get', 'workYear'], temp_active_years]

    let tempNregaStyle = {
      filter: tempFilter,
      'shape-points': nregaStyle['shape-points'],
      'shape-radius': nregaStyle['shape-radius'],
      'shape-fill-color': nregaStyle['shape-fill-color']
    }


    setNregaStyle(tempNregaStyle);

    const nregaVectorSource = await nregaLayerRef.current.getSource();
    mapRef.current.removeLayer(nregaLayerRef.current);

    let nregaWebGlLayer = new WebGLPointsLayer({
      source: nregaVectorSource,
      style: tempNregaStyle,
    })

    nregaLayerRef.current = nregaWebGlLayer;

    mapRef.current.addLayer(nregaLayerRef.current)

  };

  const handlePlanningClick = () => {
    if (currentPlan !== null) {
      setFocusTrigger(false);
      setPlanningState(!planningState);
    } else {
      toast.error("First, select a plan!");
      setFocusTrigger(true);
    }
  };

  return (
    <>
      <Toaster />
      <div className={styles.map_container}>
        <div ref={mapElement} className={styles.map} />

        <div className={styles.header_buttons}>
          <MenuSimple />
          <Button
            onClick={handleNregaButtonClick}
            label={t("NREGA Works")}
            isDropdown={true}
          />
        </div>

        <div className={styles.header_secondary_buttons}>
          <div className={styles.header_secondary_button}>
            <Button
              onClick={zoomToGPSLocation}
              isIcon={true}
              icon={faCrosshairs}
            />
          </div>
          <div className={styles.header_secondary_button}>
            <Button
              onClick={handleInfoClick}
              isIcon={true}
              icon={faInfoCircle}
            />
          </div>
          <div className={styles.header_secondary_button}>
            <Button
              onClick={onOpenLayers}
              isIcon={true}
              icon={faLayerGroup}
            />
          </div>
          <div className={styles.header_secondary_button}>
            {!isInBlock && (
              <Button
                onClick={zoomToBlockExtents}
                isIcon={true}
                icon={faCompass}
              />
            )}
          </div>
        </div>
        <InfoModal isOpen={showInfoModal} onClose={handleInfoClose} />
        <LayersBottomSheet />

        {isLoading && <Loader isOpen={isLoading} />}

        <div className={styles.footer_buttons_main}>
          <div className={styles.footer_planning}>
            {planningState && (
              <div className={styles.footer_planning_menu}>
                <Button onClick={handleGroundWaterButtonClick} label={t("GroundWater")} />
                <Button onClick={handleWaterBodiesButtonClick} label={t("Surface WaterBodies")} />
                <Button onClick={handleAgriButtonClick} label={t("Agri")} />
                <Button onClick={handleLivelihoodButtonClick} label={t("Livelihood")} />
                {/* <Button onClick={handleForestButtonClick} label={"Forest"} /> */}
              </div>
            )}
          </div>
          <div className={styles.footer_buttons_main_group}>
            <Button onClick={handleSmButtonClick} label={t("Resource Mapping")} />
            <Button onClick={handlePlanningClick} label={t("Planning")} />
          </div>
        </div>

        <Modal
          isOpen={showNregaDropdown}
          onClose={handleNregaButtonClick}
          body={
            <>
              <div className={styles.Modal_title}>
                {t("Select NREGA Works")}
              </div>
              <div className={styles.nrega_section}>
                <div className={styles.nrega_title}>{t("NREGA Work Categories")}</div>
                <div className={styles.chips_nrega_dropdown}>
                  {works.map((item, idx) => {
                    const color = [buttonColorMapping[item], buttonColorMapping.Default];
                    return (
                      <button
                        key={idx}
                        style={{
                          backgroundColor: `${nregaWorks.includes(item)
                            ? `rgba(${color[0].join(",")})`
                            : ""
                            }`,
                          border: 'none',
                          color: 'black',
                          padding: '10px 20px',
                          textAlign: 'center',
                          textDecoration: 'none',
                          display: 'inline-block',
                          margin: '4px 2px',
                          borderRadius: '16px'
                        }}
                        onClick={() => handleWorksToggle(item)}
                      >
                        {properWorkNames[idx]}
                      </button>
                    );
                  })}
                </div>

                <div className={styles.nrega_title}>{t("Filter NREGA Works")}</div>
                <div className={styles.chips_nrega_dropdown}>
                  {nregaYears != null &&
                    nregaYears.map((item) => {
                      return (
                        <FormControlLabel
                          control={
                            <PurpleSwitch
                              checked={activeYears.includes(item) ? true : false}
                              onChange={() => handleNregaYearToggle(item)}
                            />
                          }
                          label={item}
                          labelPlacement="bottom"
                        />
                      );
                    })}
                </div>

              </div>

              <div></div>
            </>
          }
          title={t("Layers")}
        />

        <NregaInfoBox
          features={selectedFeatures}
          isOpen={showBottomSheet}
          onClose={() => {
            setShowBottomSheet(false); setInfoBoxType(null);
          }}
          infoType={infoBoxType}
        />
      </div>
    </>
  );
}

export default MainMap;
