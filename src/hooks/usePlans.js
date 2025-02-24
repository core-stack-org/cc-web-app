import { create } from "zustand";

const usePlansStore = create((set) => ({
    currentPlan : null,
    plans : null,

    focusTrigger : false,

    //? Store Zoom levels and map center also
    zoomLevel : null,
    mapCenter : null,

    fetchPlans : async(url) => {
        try{
            let response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "ngrok-skip-browser-warning": "1",
                        "Content-Type": "application/json",
                    }
                }
            )
            response = await response.json()

            //console.log(response)
            set({plans : response.plans})
        }
        catch(e){
            console.log("Not able to Fetch Plans !")
        }
    },
    setCurrentPlan : (id) => set((state) => ({currentPlan : id})),
    setFocusTrigger : (currentState) => set((state) => ({focusTrigger : currentState})),

    //* Set the Zoom and map center level here
    setZoomLevel : (level) => set((state) => ({zoomLevel : level})),
    setMapCenter : (coord) => set((state) => ({mapCenter : coord}))
    
}))

export default usePlansStore;