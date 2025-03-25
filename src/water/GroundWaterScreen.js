import "ol/ol.css";
import "ol-ext/dist/ol-ext.css";
import styles from "./GroundWaterScreen.module.css";

import * as extent from "ol/extent";
import * as proj from "ol/proj";

import { Fill, Icon, Stroke } from "ol/style.js";
import { Feature, Map, View, Geolocation } from "ol";
import React, { useEffect, useRef, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { faCompass, faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { getImageLayer, getVectorLayer } from "../helper/utils";
import toast, { Toaster } from "react-hot-toast";

import Box from "@mui/material/Box";
import { Circle as CircleStyle } from "ol/style.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InfoWaterModal from "../info/infoWaterModal";
import Loader from "../info/loader";
import { Point } from "ol/geom";
import Select from "ol/interaction/Select.js";
import Slider from "@mui/material/Slider";
import { Style } from "ol/style.js";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

import mapMarker from "../asset/map_marker.svg";
import LargeWaterBody from "../asset/waterbodiesScreenIcon.svg";

import iconsDetails from "../helper/icons.json";

import settlementIcon from "../asset/settlement_icon.svg";
import Button from "../components/Button";

import useAnalyzeModal from "../hooks/useAnalyzeModal";
import GroundWaterModal from "../analyze/GroundWaterModal";

import useOdkModal from "../hooks/useOdkModal";
import Assetform from "../assetform/assetform.js";
import useMapLayers from "../hooks/useMapLayers.js";
import useLayersModal from "../hooks/useLayersModal.js";
import usePlansStore from "../hooks/usePlans.js";
import useMainScreenModal from "../hooks/useMainModal.js";

import groundwaterScreenIcon from "../asset/groundwaterScreenIcon.svg";
import MenuSimple from "../components/MenuSimple.js";
import LayersBottomSheet from "../components/LayersBottomSheet.js";

import { useTranslation } from 'react-i18next';

const blankStyle = new Style({
    stroke: new Stroke({
        color: "#e4c1f9",
        width: 1,
    }),
    fill: new Fill({
        color: "rgba(255, 255, 255, 0)",
    }),
});

const data = [
    {
        label: "2017-2022",
        value: "2017",
    },
    {
        label: "2018-2023",
        value: "2018",
    },
];

const marks = data.map((item, index) => ({
    value: index,
    label: item.label,
}));

function valuetext(value) {
    return data[value].value;
}

const theme = createTheme({
    components: {
        MuiSlider: {
            styleOverrides: {
                markLabel: {
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "bold",
                },
            },
        },
    },
});

const notify_propose_new_recharge_structure = () =>
    toast("Place the marker on the map and provide specifications", {
        duration: 6000,
        position: "top-center",
        style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
        },
    });

function GroundWaterScreen({
    setScreenTitle,
    setScreenIcon,
    setGpsLocationMain,
}) {
    const onOpen = useAnalyzeModal((state) => state.onOpen);

    const onOpenLayers = useLayersModal((state) => state.onOpen);

    const onSetState = useOdkModal((state) => state.onSetState);
    const onOpenOdk = useOdkModal((state) => state.onOpen);
    const onCloseOdk = useOdkModal((state) => state.onClose);

    const currentScreen = useOdkModal((state) => state.currentScreen);

    const updateStatus = useOdkModal((state) => state.updateStatus);
    const isLayerUpdating = useOdkModal((state) => state.isLoading)
    const isLayerUpdated = useOdkModal((state) => state.LayerUpdated)
    const updateLayerState = useOdkModal((state) => state.updateLayerStatus)

    const onSetAssetType = useMainScreenModal((state) => state.onSetAssetType)
    const settlementModalToggle = useMainScreenModal((state) => state.onSettlementToggle)
    const settlementModal = useMainScreenModal((state) => state.onOpen)
    const onSetSettlementInfo = useMainScreenModal((state) => state.onSetSettlementInfo)

    const updateFeature = useAnalyzeModal((state) => state.updateFeature);

    const LayerStore = useMapLayers((state) => state);

    const { currentPlan, zoomLevel, mapCenter, setZoomLevel, setMapCenter } = usePlansStore((state) => {
        return {
            currentPlan: state.currentPlan,
            zoomLevel : state.zoomLevel,
            mapCenter : state.mapCenter,
            setZoomLevel : state.setZoomLevel,
            setMapCenter : state.setMapCenter
        };
    });

    const { t } = useTranslation();

    const mapElement = useRef();
    const mapRef = useRef();
    const osmLayerRef = useRef();
    const adminLayerRef = useRef();
    const deltaGLayerRef = useRef();
    const deltaGLayerFortnightRef = useRef();
    const clartLayerRef = useRef();
    const equityLayerRef = useRef();
    const positionFeatureRef = useRef();
    const hamletLayerRef = useRef();
    const featureLayerRef = useRef();
    const planLayerRef = useRef();
    const drainageLayerRef = useRef();
    const waterbodiesLayerRef = useRef();

    const navigate = useNavigate();

    const selectedStyle = new Style({
        fill: new Fill({
            color: "rgba(255, 255, 255, 0.3)",
        }),
        stroke: new Stroke({
            color: "#1AA7EC",
            width: 1,
        }),
    });

    function changePolygonColor(color) {
        return new Style({
            fill: new Fill({
                color: color,
                opacity: 0.4,
            }),
            stroke: new Stroke({
                color: "transparent",
                width: 0,
            }),
        });
    }


    const [showClartOverlay, setClartOverlay] = useState(false);
    const [clartlayer, setClartLayer] = useState(null);

    const [buttondisplay, setButtonDisplay] = useState(null);
    const [sliderdisplay, setSliderDisplay] = useState(false);
    const [showInfoWaterModal, setShowInfoWaterModal] = useState(false);
    const [gpsLocation, setGpsLocation] = useState(null);
    const [isInBlock, setIsInBlock] = useState(true);

    const [showProposeButton, setShowProposeButton] = useState(true);

    const [deltaGLayerVisible, setDeltaGLayerVisible] = useState(true);
    const [clartLayerVisible, setClartLayerVisible] = useState(false);
    const [drainageLayerVisible, setDrainageLayerVisible] = useState(false);

    const [assetInfoButton, setAssetInfoButton] = useState(false);

    const [currentLegend, setCurrentLegend] = useState("MWS");
    const [currentlatlong, setCurrentLatLong] = useState(null);
    const [selectedFortnightFeature, setSelectedFortnightFeature] = useState(null);
    const [selectedWellDepthFeature, setSelectedWellDepthFeature] = useState(null);
    const [isBuildRechargeStructureActive, setIsBuildRechargeStructureActive] = useState(false);
    const [isIconFeatureActive, setIsIconFeatureActive] = useState(false);
    const [selectedWork, setSelectedWork] = useState(null)

    const [isTransientState, setIsTransientState] = useState(false);
    const [isTransientHamletState, setIsTransientHamletState] = useState(false);

    //? State Machine Code
    const STATE_MACHINE = {
        "main_screen": {
        Screen : "main_screen",
        },
        "start_planning": {
        Screen : "start_planning",
        BACK: "main_screen",
        },
        "add_hemlet": {
        Screen : "add_hemlet",
        BACK: "start_planning",
        },
    };

    const state_transition = (newScreen) => {
        updateStatus(newScreen);
        window.history.pushState(null, "", `#${newScreen}`);
    }

    const iconFeature = new Feature({
        geometry: new Point([0, 0]),
    });

    const iconStyle = new Style({
        image: new Icon({
            anchor: [0.5, 46],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            src: mapMarker,
        }),
    });

    iconFeature.setStyle(iconStyle);

    const fullstyle = new Style({
        stroke: new Stroke({
            color: "#f00",
            width: 1.5,
        }),
        fill: new Fill({
            color: "rgba(0, 0, 0, 0)", // Fully opaque black
        }),
    });

    const handleClartButtonClick = () => {
        // Toggle the visibility for CLART and MWS layers
        setClartOverlay(true);
        setClartLayerVisible((prev) => !prev);
        handleLayerToggle(clartLayerRef.current);
        setDeltaGLayerVisible((prev) => !prev);
        handleLayerToggle(deltaGLayerRef.current);

        //updateStatus("start_planning");
        state_transition("start_planning")

        // Determine which legend to show based on layer visibility
        if (!clartLayerVisible) {
            setCurrentLegend("CLART");
        } else if (deltaGLayerVisible) {
            setCurrentLegend("MWS");
        }

        drainageLayerRef.current.setVisible(true);
        setDrainageLayerVisible(true);
    };

    const handleLayerToggle = (layer) => {
        layer.setVisible(!layer.getVisible());
    };

    const handleAnalyzeButtonClick = () => {
        if (selectedFortnightFeature && selectedWellDepthFeature) {
          const fortnightFeatureProperties =
            selectedFortnightFeature.getProperties();
          const welldepthFeatureProperties =
            selectedWellDepthFeature.getProperties();

          delete fortnightFeatureProperties.geometry; // avoids serialization issues
          delete welldepthFeatureProperties.geometry;

          updateFeature({
            fortnight: fortnightFeatureProperties,
            welldepth: welldepthFeatureProperties,
          });
          onOpen();
        } else {
          toast.error("Both Fortnight and Well Depth values are not selected.");
        }
      };

    // TODO: Clart layer not showing while adding new build structures, also any more layers to display?
    const handleBuldStButton = () => {

        //updateStatus("add_hemlet");
        state_transition("add_hemlet")

        setIsBuildRechargeStructureActive(true);
        handleLayerToggle(hamletLayerRef.current);
        handleLayerToggle(clartLayerRef.current);
        notify_propose_new_recharge_structure();

        // show layers
        clartLayerRef.current.setVisible(true);
        setSliderDisplay(false);
    };

    const handleFinishButton = () => {
        setIsBuildRechargeStructureActive(false);
        setClartOverlay(false);
        setClartLayerVisible(false);
        setDeltaGLayerVisible(false);
        clartLayerRef.current.setVisible(false);
        setDrainageLayerVisible(true);
        const url =
            "/maps?geoserver_url=" +
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

    const handleFeedbackButtonClick = (latlong) => {

            let redirectState = {
                latlong: latlong,
                screen_code: "add_pr_new_rc_st",
                block_name: localStorage.getItem("block_name"),
                redirect_url: "",
                next_screen: "",
                layerName: "planning_layer",
                planID: currentPlan.plan_id,
                planName: currentPlan.plan.toLowerCase(),
                state: "planning",
                work_type: "plan_gw"
            };

            onSetState(redirectState);

            onOpenOdk();

    };

    const handleMaintainenceButtonClick = () => {

            let redirectState = {
                latlong: currentlatlong,
                screen_code: "propose_maintenance_groundwater",
                block_name: localStorage.getItem("block_name"),
                redirect_url: "",
                next_screen: "",
                layerName: "planning_layer",
                planID: currentPlan.plan_id,
                planName: currentPlan.plan.toLowerCase(),
                state: "none",
                work_id : selectedWork,
            };

            onSetState(redirectState);

            onOpenOdk();
    };

    const handleInfoClick = () => {
        setShowInfoWaterModal(true);
    };

    const handleInfoClose = () => {
        setShowInfoWaterModal(false);
    };

    const handleAssetInfoModal = (assetType) => {
        onSetAssetType(assetType)
        settlementModalToggle()
        settlementModal()
    }

    const drainageColors = ["03045E","023E8A","0077B6","0096C7","00B4D8","48CAE4","90E0EF","ADE8F4","CAF0F8"]

    //Grabbing info from the URL

    useEffect(() => {
        setScreenTitle("GroundWater");
        setScreenIcon(groundwaterScreenIcon);
        updateStatus("main_screen");
        onCloseOdk()
        const promptForGeolocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setGpsLocation([longitude, latitude]);
                        setGpsLocationMain([longitude, latitude]);
                    },
                    (error) => {
                        console.error("Error accessing geolocation:", error);
                        //fetchMaps()
                    }
                );
            } else {
                console.error("Geolocation is not available in this browser.");
            }
        };
        promptForGeolocation();
        LayerStore.resetLayersState()
    }, []);

    useEffect(() => {
        let BaseLayer = null;
        let deltaGLayer = null;
        let deltaGLayerFortnight = null;
        let equityLayer = null;
        let clartLayer = null;
        let hamlet_layer = null;
        let pointLayer = null;
        let planLayer = null;
        let drainageLayer = null;
        let waterbodies_layer = null;

        if (BaseLayer === null) {
            BaseLayer = new TileLayer({
                source: new XYZ({
                    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
                    maxZoom: 30,
                }),
                visible: true,
            });
        }

        if (deltaGLayer === null) {
            deltaGLayer = getVectorLayer(
                "mws_layers",
                "deltaG_well_depth_" + localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase(),
                true,
                true
            );
        }

        if (deltaGLayerFortnight === null) {
            deltaGLayerFortnight = getVectorLayer(
                "mws_layers",
                "deltaG_fortnight_" + localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase(),
                false,
                true
            );
        }

        deltaGLayerFortnight.setOpacity(0.1);
        deltaGLayerFortnight.setVisible(true);
        deltaGLayerFortnight.setStyle(blankStyle);

        const adminLayer = getVectorLayer(
            "panchayat_boundaries",
            localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase(),
        );

        if (equityLayer === null) {
            equityLayer = getVectorLayer(
                "equity",
                localStorage.getItem("block_name").toLowerCase() + "_equity"
            );
        }

        equityLayer.setStyle(fullstyle);

        if (clartLayer === null) {
            clartLayer = getImageLayer(
                "clart",
                localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase() + "_clart"
            );
        }

        clartLayer.setOpacity(0.5);
        setClartLayer(clartLayer);

        if (hamlet_layer === null) {
                hamlet_layer = getVectorLayer(
                    "resources",
                    "hemlet_layer" + localStorage.getItem("block_name").toLowerCase(),
                    true,
                    true,
                    "settlement",
                    currentPlan.plan_id
                );
        }

        if (waterbodies_layer === null) {
            waterbodies_layer = getVectorLayer(
              "resources",
              "wb_layer" + localStorage.getItem("block_name").toLowerCase(),
              true,
              true,
              "waterbody",
              currentPlan.plan_id
            );
        }

        waterbodies_layer.setStyle(function(feature) {
            const status = feature.values_;
            if(status.wbs_type in iconsDetails.WB_Icons){
                return new Style({
                    image: new Icon({ src: iconsDetails.WB_Icons[status.wbs_type] }),
                })
            }
            else{
                return new Style({
                    image: new Icon({ src: LargeWaterBody }),
                })
            }
        });

        if (drainageLayer === null) {
            drainageLayer = getVectorLayer(
                "drainage",
                localStorage.getItem("block_name").toLowerCase() + "_drainage_lines",
                false,
                true,
                "drainage",
                currentPlan.plan_id
            );
        }

        hamlet_layer.setStyle(function(feature) {
            return new Style({
                image: new Icon({ src: settlementIcon , scale : 0.4}),
            });
        });

        drainageLayer.setStyle(function(feature) {

            let order = feature.values_.ORDER

            return new Style({
                stroke: new Stroke({
                    color: `#${drainageColors[order-1]}`,
                    width: 2.0,
                }),
            })

        })

        const vectorSource = new VectorSource({
            features: [iconFeature],
        });

        const featureLayer = new VectorLayer({
            source: vectorSource,
            visible: true,
        });

        if (planLayer === null) {
                planLayer = getVectorLayer(
                    "works",
                    "plan_layer_gw" + localStorage.getItem("block_name").toLowerCase(),
                    true,
                    false,
                    "plan_gw",
                    currentPlan.plan_id
                );
        }

        const positionFeature = new Feature({
            geometry: new Point([78.9, 20.5]),
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

        if (pointLayer === null) {
            pointLayer = new VectorLayer({
                source: new VectorSource({
                    features: [positionFeature],
                }),
            });
        }

        osmLayerRef.current = BaseLayer;
        deltaGLayerRef.current = deltaGLayer;
        deltaGLayerFortnightRef.current = deltaGLayerFortnight;
        adminLayerRef.current = adminLayer;
        equityLayerRef.current = equityLayer;
        clartLayerRef.current = clartLayer;
        positionFeatureRef.current = positionFeature;
        hamletLayerRef.current = hamlet_layer;
        featureLayerRef.current = featureLayer;
        planLayerRef.current = planLayer;
        drainageLayerRef.current = drainageLayer;
        waterbodiesLayerRef.current = waterbodies_layer

        setIsBuildRechargeStructureActive(false);
        setClartOverlay(false);
        setClartLayerVisible(false);
        setDeltaGLayerVisible(true);
        clartLayerRef.current.setVisible(false);
        setDrainageLayerVisible(true);
        deltaGLayerRef.current.setVisible(true);

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

        planLayerRef.current.setStyle(function(feature) {
            const status = feature.values_;
            if(status.TYPE_OF_WO in iconsDetails.Recharge_Icons){
                return new Style({
                    image: new Icon({ src: iconsDetails.Recharge_Icons[status.TYPE_OF_WO] }),
                })
            }
            else{
                return new Style({
                    image: new Icon({ src: LargeWaterBody }),
                })
            }
        });

        const view = new View({
            center: [78.9, 20.5],
            zoom: zoomLevel !== null ? zoomLevel : 13,
            projection: "EPSG:4326",
        });

        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                BaseLayer,
                deltaGLayer,
                deltaGLayerFortnight,
                adminLayer,
                clartLayer,
                hamlet_layer,
                drainageLayer,
                planLayer,
                waterbodies_layer,
                pointLayer,
                featureLayer
            ],
            view: view,
        });

        mapRef.current = initialMap;

       //? Code for Listening The Zoom Event and Scale Icons

       let currentZoom = mapRef.current.getView().getZoom()

       mapRef.current.on('moveend', (e) => {
       let newZoom = mapRef.current.getView().getZoom()
       var arr = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
       setMapCenter([(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2])
       setZoomLevel(newZoom)
       if(currentZoom > newZoom){
           currentZoom = newZoom
           let newScale = (newZoom % 10) * 0.1
           if(newScale <= 0.4)
           newScale = 0.4
           hamletLayerRef.current.setStyle(
           new Style({
               image: new Icon({ src: settlementIcon, scale : newScale}),
           })
           );
       }
       else if(currentZoom < newZoom){
           currentZoom = newZoom
           let newScale = (newZoom % 10) * 0.1
           if(newScale <= 0.4)
           newScale = 0.4
           hamletLayerRef.current.setStyle(
           new Style({
               image: new Icon({ src: settlementIcon, scale : newScale}),
           })
           );
        }
       })


        LayerStore.updateStatus(false)

        LayerStore.resetLayersState()

        LayerStore.addLayersState("Well Depth Layer", deltaGLayerRef, LayerStore.Layers)
        LayerStore.addLayersState("Equity Layer", equityLayerRef, LayerStore.Layers)
        LayerStore.addLayersState("CLART Layer", clartLayerRef, LayerStore.Layers)
        LayerStore.addLayersState("Plan Layer", planLayerRef, LayerStore.Layers)
        LayerStore.addLayersState("Settlement Layer", hamletLayerRef, LayerStore.Layers)
        LayerStore.addLayersState("Drainage Layer", drainageLayerRef, LayerStore.Layers)
        LayerStore.addLayersState("Water Structures Layer", waterbodiesLayerRef, LayerStore.Layers)

        LayerStore.updateStatus(true)

        initialMap.on(
            "click",
            (e) => {
              setCurrentLatLong(e.coordinate);
              setShowProposeButton(false);
              setSelectedWork(null);
              setAssetInfoButton(false);

              initialMap.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
                if (layer === deltaGLayerFortnightRef.current) {
                  setSelectedFortnightFeature(feature);
                  toast.success(
                    `Selected Well Depth Layer with id ${feature.values_.uid}`
                  );
                  setButtonDisplay(true);
                  featureLayerRef.current.setVisible(true);
                  iconFeature.setStyle(iconStyle);
                  iconFeature.getGeometry().setCoordinates(e.coordinate);
                  setIsIconFeatureActive(true);
                }
                if (layer === deltaGLayerRef.current) {
                  setSelectedWellDepthFeature(feature);
                  toast.success(
                    `Selected Well Depth Layer with id ${feature.values_.uid}`
                  );
                  setButtonDisplay(true);
                  featureLayerRef.current.setVisible(true);
                  iconFeature.setStyle(iconStyle);
                  iconFeature.getGeometry().setCoordinates(e.coordinate);
                  setIsIconFeatureActive(true);
                }

                if (layer == hamlet_layer) {
                  setIsTransientHamletState(true);
                  toast.success(
                    `Selected Hamlet Layer with id ${feature.values_.uid}`
                  );
                  setButtonDisplay(true);
                  featureLayerRef.current.setVisible(true);
                  iconFeature.setStyle(iconStyle);
                  iconFeature.getGeometry().setCoordinates(e.coordinate);
                  setIsIconFeatureActive(true);
                }

                if (layer == planLayer) {
                  setShowProposeButton(true);
                  setSelectedWork(feature.values_.work_id);
                  setButtonDisplay(true);
                  featureLayerRef.current.setVisible(true);
                  iconFeature.setStyle(iconStyle);
                  iconFeature.getGeometry().setCoordinates(e.coordinate);
                  setIsIconFeatureActive(true);
                  onSetSettlementInfo(feature.values_)
                  setAssetInfoButton(true);
                  console.log(feature.values_)
                }

                if(layer === waterbodies_layer){
                    setAssetInfoButton(true);
                    onSetSettlementInfo(feature.values_)
                    setShowProposeButton(true);
                    setSelectedWork(feature.values_.wb_id);
                }
              });
              const select = new Select({
                layers: [deltaGLayerRef.current],
                style: selectedStyle,
              });
              initialMap.addInteraction(select);
              select.on("select", (e) => {
                const selectedFeatures = select.getFeatures();
                selectedFeatures.forEach((feature) => {
                  if (feature.get("layer") === "mws") {
                    feature.setStyle(selectedStyle);
                    featureLayerRef.current.setVisible(false);
                  }
                });
              });
            },
            []
          );

        const Vectorsource = adminLayer.getSource();
        Vectorsource.once("change", function(e) {
            if (Vectorsource.getState() === "ready") {
                initialMap.getView().setCenter(mapCenter);
            }
        });

        const deltagVectorSource = deltaGLayer.getSource();
        deltagVectorSource.once("change", function(e) {
            if (deltagVectorSource.getState() === "ready") {
                setSliderDisplay(true);
            }
        });

        const accuracyFeature = new Feature();

        const geolocation = new Geolocation({
            // enableHighAccuracy must be set to true to have the heading value.
            trackingOptions: {
                enableHighAccuracy: true,
            },
            projection: view.getProjection(),
        });

        geolocation.on("change:accuracyGeometry", function() {
            accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
        });

        geolocation.on("change", function() {
            const coordinates = geolocation.getPosition();
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

        return () => {
            initialMap.setTarget(null);
        };
    }, [currentPlan]);

    useEffect(() => {
        if (gpsLocation != null) {
            const blockExtent = adminLayerRef.current.getSource().getExtent(); // Get the extent of the active block
            const gpsCoordinate = proj.fromLonLat(gpsLocation);
            positionFeatureRef.current.setGeometry(new Point(gpsCoordinate));
            const isWithinExtent = extent.containsCoordinate(
                blockExtent,
                gpsCoordinate
            );

            if (isWithinExtent) {
                // Zoom to GPS location and adjust the view
                mapRef.current.getView().setCenter(gpsCoordinate);
                mapRef.current.getView().setZoom(13); // Adjust the zoom level as needed
            }
        }
    }, [gpsLocation]);

    useEffect(() => {
        const handleBackButton = () => {
            const currentState = STATE_MACHINE[currentScreen];
            if (currentState && currentState.BACK) {
              updateStatus(currentState.BACK);
              if(currentState.BACK == "main_screen"){
                setClartOverlay(false);
                setClartLayerVisible((prev) => !prev);
                handleLayerToggle(clartLayerRef.current);
                setDeltaGLayerVisible((prev) => !prev);
                handleLayerToggle(deltaGLayerRef.current);
                if (!clartLayerVisible) {
                    setCurrentLegend("CLART");
                } else if (deltaGLayerVisible) {
                    setCurrentLegend("MWS");
                }

                drainageLayerRef.current.setVisible(false);
                setDrainageLayerVisible(false);
              }
              else if(currentState.BACK == "start_planning"){
                setIsBuildRechargeStructureActive(true);
                handleLayerToggle(hamletLayerRef.current);
                setSliderDisplay(true);
              }
            }
        };
        window.addEventListener("popstate", handleBackButton);
        return () => {
          window.removeEventListener("popstate", handleBackButton);
        };
    }, [currentScreen]);

    // for updating the plan layer and re-rendering the map
    useEffect(() => {
        if (isLayerUpdated) {
            let planLayer = null

            planLayer = getVectorLayer(
                "works",
                "plan_layer_gw" + localStorage.getItem("block_name").toLowerCase(),
                true,
                false,
                "plan_gw",
                currentPlan.plan_id
            );

            if (planLayer !== null) {

                planLayer.setStyle(function(feature) {
                    const status = feature.values_;
                    if(status.TYPE_OF_WO in iconsDetails.Recharge_Icons){
                        return new Style({
                            image: new Icon({ src: iconsDetails.Recharge_Icons[status.TYPE_OF_WO] }),
                        })
                    }
                    else{
                        return new Style({
                            image: new Icon({ src: LargeWaterBody }),
                        })
                    }
                });
            }

            mapRef.current.removeLayer(planLayerRef.current)

            planLayerRef.current = planLayer

            mapRef.current.addLayer(planLayer)

            updateLayerState(false)
        }
    }, [isLayerUpdated])

    const zoomToGPSLocation = () => {
        // For the time being, zooming to current location for testing
        // To zoom only within the extent of the block, remove the marked lines and uncomment the lines below it.
        try {
            if (mapRef.current && gpsLocation) {
                mapRef.current.getView().setCenter(gpsLocation);
                positionFeatureRef.current.setGeometry(new Point(gpsLocation));
                mapRef.current.getView().setZoom(18); // remove after testing
            }
            const blockExtent = adminLayerRef.current.getSource().getExtent();
            //const gpsCoordinate = proj.fromLonLat(gpsLocation);
            const isWithinBlock = extent.containsCoordinate(blockExtent, gpsLocation);
            setIsInBlock(isWithinBlock);
        } catch (err) {
            toast("Getting Location !!");
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

    const handlePropChange = function(year_index) {
        deltaGLayerRef.current.getSource().forEachFeature(function(feature) {
            const year_value = data[year_index].value;
            let bin;
            if (year_value == 2017) {
                bin = feature.values_["Net" + year_value + "_22"];
            } else if (year_value == 2018) {
                bin = feature.values_["Net" + year_value + "_23"];
            }

            if (bin < -5) {
                feature.setStyle(changePolygonColor("rgba(255, 0, 0, 0.5)")); // red
            } else if (bin >= -5 && bin < -1) {
                feature.setStyle(changePolygonColor("rgba(255, 255, 0, 0.5)")); // yellow
            } else if (bin >= -1 && bin <= 1) {
                feature.setStyle(changePolygonColor("rgba(0, 255, 0, 0.5)")); // green
            } else if (bin > 1) {
                feature.setStyle(changePolygonColor("rgba(0, 0, 255, 0.5)")); // blue
            }
        });
    };


    const handleLayersButtonToggle = () => {
        onOpenLayers();
    };

    return (
        <>
            <div className={styles.map_container}>
                <Toaster />
                {sliderdisplay && (
                    <div className={`${styles.slider_container} t3`}>
                        <ThemeProvider theme={theme}>
                            <CustomSlider
                                className={styles.custom_slider}
                                handlePropChange={handlePropChange}
                                defaultValue={handlePropChange(0)}
                            />
                        </ThemeProvider>
                    </div>
                )}
                <GroundWaterModal />

                <Assetform />
                <LayersBottomSheet/>

                <div ref={mapElement} style={{ width: "100vw", height: "100%" }} />

                <div className={styles.header_buttons}>
                    <MenuSimple isDisabled={true} />

                    <Button
                        isBack={true}
                        label={t("Layers")}
                        onClick={handleLayersButtonToggle}
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
                        <button
                            className={`${styles.info_button} t8`}
                            onClick={handleInfoClick}
                        >
                            <FontAwesomeIcon icon={faInfoCircle} />
                        </button>
                    </div>

                    <div className={styles.header_secondary_button}>
                        {!isInBlock && (
                            <button
                                className={styles.info_button}
                                onClick={zoomToBlockExtents}
                            >
                                <FontAwesomeIcon icon={faCompass} />
                            </button>
                        )}
                    </div>
                </div>

                <InfoWaterModal
                    isOpen={showInfoWaterModal}
                    onClose={handleInfoClose}
                    currentLegend={currentLegend}
                />

                {isLayerUpdating && <Loader isOpen={isLayerUpdating} />}
                <div className={styles.footer_buttons}>
                    
                    <div className={styles.footer_buttons_main_group}>
                        {currentScreen === "main_screen" && buttondisplay && (
                            <Button label={t("Analyse")} onClick={handleAnalyzeButtonClick} />
                        )}

                        {currentScreen === "main_screen" && buttondisplay && (
                            <Button
                                label={t("Start Planning")}
                                isDisabled={!clartLayerVisible}
                                onClick={handleClartButtonClick}
                            />
                        )}
                    </div>
                    <div className={styles.footer_buttons_main_group}>
                        {currentScreen === "main_screen" && buttondisplay && (
                            <Button
                                label={t("Asset Info")}
                                isNext={true}
                                isDisabled={assetInfoButton}
                                onClick={() => handleAssetInfoModal("recharge")}
                            />
                        )}
                    </div>
                    {currentScreen === "start_planning" && (
                        <>
                            <Button
                                label={t("Build New Recharge Structure")}
                                onClick={handleBuldStButton}
                            />
                            <Button
                                label={t("Propose Maintenance")}
                                onClick={handleMaintainenceButtonClick}
                                isDisabled={showProposeButton}
                            />
                        </>
                    )}

                    {currentScreen === "add_hemlet" && (
                        <div className={styles.footer_buttons_main_group}>
                            {isBuildRechargeStructureActive && (
                                <Button
                                    label={t("Provide Specifications")}
                                    onClick={() => handleFeedbackButtonClick(currentlatlong)}
                                    isDisabled={isIconFeatureActive}
                                />
                            )}
                            <Button label={t("Finish")} onClick={handleFinishButton} />
                        </div>
                    )}

                    {currentScreen === "show_hamlet_layer" && (
                        <>
                            <div className={styles.footer_buttons_main_group}>
                                {isBuildRechargeStructureActive && (
                                    <Button
                                        label={t("Provide Specifications")}
                                        isDisabled={!isTransientState}
                                        onClick={() => handleFeedbackButtonClick(currentlatlong)}
                                    />
                                )}
                            </div>
                            <Button label={t("Finish")} onClick={handleFinishButton} />
                        </>
                    )}

                    {currentScreen === "mapping_complete" && (
                        <>
                            <div className={styles.footer_buttons_main_group}>
                                {isBuildRechargeStructureActive && (
                                    <Button
                                        label={t("Provide Specifications")}
                                        onClick={() => handleFeedbackButtonClick(currentlatlong)}
                                    />
                                )}
                            </div>
                            <div className={styles.footer_buttons_main_group}>
                                <Button label={t("Finish")} onClick={handleFinishButton} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

const CustomSlider = ({ handlePropChange }) => {
    const [currentValue, setCurrentValue] = useState(0);

    return (
        <Box
            sx={{
                width: 250,
                margin: "10px auto",
                borderRadius: "10px",
                padding: "10px",
            }}
        >
            <Slider
                aria-label="Years"
                defaultValue={handlePropChange(currentValue)}
                valueLabelDisplay="off"
                step={null}
                marks={marks}
                max={marks.length - 1}
                value={currentValue}
                onChange={(event, newValue) => {
                    setCurrentValue(newValue);
                    handlePropChange(newValue);
                }}
                getAriaValueText={valuetext}
                color="primary"
            />
        </Box>
    );
};

export default GroundWaterScreen;
