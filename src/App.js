import "./App.css";
import { useState, useEffect } from "react";
import MainMap from "./maps/MainMap.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GroundWaterScreen from "./water/GroundWaterScreen";
import WaterBodiesScreen from "./waterbodies/WaterBodiesScreen";
import AgriScreen from "./agri/AgriScreen";
import ResourceMappingScreen from "./socialmapping/socialmapping";

import HamMenu from "./components/HamMenu.js";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import getStates from "./actions/getStates.js";
import useMainScreenModal from "./hooks/useMainModal.js";
import MainScreenModal from "./components/MainScreenModal.js";
import Livelihood from "./livelihood/Livelihood.js";
import usePlansStore from "./hooks/usePlans.js";

import blockIds from './block_id.json'
import { api_url } from "./helper/constants.js";
import useOdkModal from "./hooks/useOdkModal.js";

function App() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [banner, setBannerVisible] = useState(false)

    const [gpsLocationMain, setGpsLocationMain] = useState(null)

    //State for The Current Screen Name and Icon
    const [screenTitle, setScreenTitle] = useState("")
    const [screenIcon, setScreenIcon] = useState(null)

    // State to set Data for Change Location Modal
    const onSetState = useMainScreenModal((state) => state.onSetState)
    const fetchPlanData = usePlansStore((state) => state.fetchPlans)

    //State to fetch the current selected Settlement
    const settlementName = useOdkModal((state) => state.settlementName)

    const getCurrentDimension = () => {
        let vh = window.innerHeight * 0.01;
        let vw = window.innerWidth * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`)
        document.documentElement.style.setProperty('--vw', `${vw}px`)
    }

    const getStatesData = async () => {
        let data = await getStates()
        onSetState(data)
    }

    useEffect(() => {

        getCurrentDimension()

        getStatesData()

        //? Grabbing info from the URL
        const queryParameters = new URLSearchParams(window.location.search);

        
        let block_id = "";
        if (localStorage.getItem("block_id") != null) {
            block_id = localStorage.getItem("block_id");
        } else {
            block_id = blockIds[queryParameters.get("block_name").toLowerCase().replace(/ /g,"_")];
        }

        fetchPlanData(`${api_url}get_plans/?block_id=${block_id}`)

        function onlineHandler() {
            setIsOnline(true);
            console.log("User is Online!");
        }

        function offlineHandler() {
            setIsOnline(false);
            console.log("User is Offline !");
        }

        function updateDimension() {
            let vh = window.innerHeight * 0.01;
            let vw = window.innerWidth * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`)
            document.documentElement.style.setProperty('--vw', `${vw}px`)
        }

        window.addEventListener("online", onlineHandler);
        window.addEventListener("offline", offlineHandler);
        window.addEventListener("resize", updateDimension)
        return () => {
            window.removeEventListener("online", onlineHandler);
            window.removeEventListener("offline", offlineHandler);
            window.removeEventListener("resize", updateDimension);
        };
    }, [isOnline]);

    const handleClose = () => {
        setBannerVisible(true)
    }

    const handleLatLongClick = () => {
        if (gpsLocationMain != null) {
            navigator.clipboard.writeText(gpsLocationMain)
        }
    }

    return (
        <>
            <HamMenu screenTitle={screenTitle} screenIcon={screenIcon} />
            <BrowserRouter>
                <Routes>
                    <Route path="/maps" element={<MainMap setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />}/>
                    <Route path="/water" element={<GroundWaterScreen setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />}/>
                    <Route path="/waterbodies" element={<WaterBodiesScreen setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />}/>
                    <Route path="/socialmapping" element={<ResourceMappingScreen setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />}/>
                    <Route path="/agri" element={<AgriScreen setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />}/>
                    <Route path="/livelihood" element={<Livelihood setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />} />
                    <Route path="/forest" element={<Livelihood setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />} />
                </Routes>
            </BrowserRouter>
            {(banner || isOnline) ? (
                <></>
            ) : (
                <div className="smart-app-banner">
                    <div className="banner-main">
                        <button className="close" onClick={handleClose}>
                            &times;
                        </button>
                        <div className="banner-meta">
                            <div>
                                <span className="banner-name">Check Connection</span>
                            </div>
                            <div>
                                <small className="banner-body">
                                    Internet Access Required to access Maps !
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="location-selector-modal">
                <MainScreenModal />
            </div>
        </>
    );
}

export default App;
