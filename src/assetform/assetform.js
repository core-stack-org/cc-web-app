import React from "react";
import "reactjs-popup/dist/index.css";
import { getOdkURLForScreen } from "../helper/utils";
import useOdkModal from "../hooks/useOdkModal";
import Modal from "../components/Modal";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api_url } from "../helper/constants";


function Assetform() {
    const isOpen = useOdkModal((state) => state.isOpen)
    const onClose = useOdkModal((state) => state.onClose)

    const odkState = useOdkModal((state) => state.odkState)

    const updateStatus = useOdkModal((state) => state.updateStatus)
    const updateLoadingState = useOdkModal((state) => state.updateLoadingState)
    const updateLayerState = useOdkModal((state) => state.updateLayerStatus)
    const settlementName = useOdkModal((state) => state.settlementName)

    const [bodyContent, setBodyContent] = useState(<></>)

    let odk_url = null

    let flag = false;

    const handleOnLoadEvent = async (next_screen) => {
        if (flag) {
            if (next_screen !== "")
                updateStatus(next_screen)

            const planName = odkState["planName"]
            const plan_id = odkState["planID"]
            const resourceType = odkState["resourceType"]
            const layerName = odkState["layerName"]
            const state = odkState["state"]
            const work_type = odkState["work_type"]

            if (state == "mapping") {

                try {
                    updateLoadingState(true)
                    const payload = {
                        layer_name: layerName,
                        resource_type: resourceType,
                        plan_id: plan_id,
                        plan_name: planName,
                        district_name: localStorage.getItem("dist_name"),
                        block_name: localStorage.getItem("block_name"),
                    };

                    console.log(payload)

                    const response = await fetch(`${api_url}add_resources/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    })

                    const res = await response.json()

                    console.log(res)

                    if (res.message == "Success") {
                        toast.success("New Mapping added !")
                        updateLayerState(true)
                    }
                    else {
                        toast.error(res.error)
                    }

                    updateLoadingState(false)
                }
                catch (err) {
                    console.log(err)
                    updateLoadingState(false)
                    toast.error("Internal Server Error ! Try Again")
                }
            }
            else if (state == "planning") {

                try {

                    updateLoadingState(true)

                    const payload = {
                        layer_name: layerName,
                        work_type: work_type,
                        plan_id: plan_id,
                        plan_name: planName,
                        district_name: localStorage.getItem("dist_name"),
                        block_name: localStorage.getItem("block_name"),
                    };

                    console.log(payload)

                    const response = await fetch(`${api_url}add_works/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    })

                    const res = await response.json()

                    console.log(res)

                    if (res.message == "Success") {
                        toast.success("New Work added !")
                        updateLayerState(true)
                    }
                    else {
                        toast.error(res.error)
                    }

                    updateLoadingState(false)
                }
                catch (err) {
                    console.log(err)
                    updateLoadingState(false)
                    toast.error("Internal Server Error ! Try Again")
                }
            }

            onClose()
        }
        flag = true
    }

    useEffect(() => {
        if (odkState != null) {
            const screen_code = odkState["screen_code"];
            const latlong = odkState["latlong"];
            const hemlet_id = odkState["hemlet_id"]
            const well_id = odkState["well_id"]
            const block_name = odkState["block_name"]
            const wb_id = odkState["wb_id"]
            const plan_id = odkState["planID"]
            const next_screen = odkState["next_screen"]
            let planName = odkState["planName"]
            let work_id = odkState["work_id"]
            let grid_id = odkState["grid_id"]
            console.log("work id is :",work_id)
            try{
                planName = planName.replace(/ /g, "%20");
            }
            catch(err){
                console.log(err)
            }
            odk_url = getOdkURLForScreen(screen_code, latlong, hemlet_id, well_id, block_name, wb_id, plan_id, planName, settlementName, work_id, grid_id);
            console.log(odk_url);
            let temp = (
                <iframe
                    id="odk-frame"
                    src={odk_url}
                    style={{ width: "100vw", height: "100vh" }}
                    onLoad={() => handleOnLoadEvent(next_screen)}
                ></iframe>
            )
            setBodyContent(temp)
        }
    }, [odkState, onClose])

    return (<Modal title={"ODK Form"} body={bodyContent} isOpen={isOpen} onClose={onClose} />)
};

export default Assetform;
