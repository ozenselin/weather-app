import { createEventManager } from "../../shared/eventManager.js";
import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";
import { getUserLocation } from "../../shared/utils/geolocation.js"
import { locationAPI } from "./api.js";
export const createEvents = (state) => {
    if (!state || !eventBus || !config) {
        throw new Error("state, event bus, and config are required");
    }

    let eventManager = null;
    let isInitialized = false;

    // event handlers
    const handleLocationChangeRequest = (newLocation) => {
        state.setCurrentLocation(newLocation);
    };

    const handleUserLocationUpdateRequest = async (respond) => {
        try {
            const geolocation = await getUserLocation();
            const {latitude, longitude} = geolocation.coords;
            const {suggestions} = await locationAPI.fetchLocationSuggestionsByCoords(latitude, longitude);

            let location = suggestions.at(0);

            state.setUserLocation(location); //update current user location

            //respond
            respond(location);

        } catch(error) {
            console.log(error);
        }
    }

    const handleAddToFavouritesRequest = (location) => {
        state.addFavouriteLocation(location);
    };

    const handleAddCurrentToFavouritesRequest = () => {
        state.addFavouriteLocation(state.getCurrentLocation());
    };

    const handleRemoveFromFavouritesRequest = (locationId) => {
        state.removeFavouriteLocation(locationId);
    };

    const handleAPISuggestionsRequest = async (query) => {
        if(!query) return;
        
        try {
            eventBus.emit("location:suggestions-started");
            const data = await locationAPI.fetchLocationSuggestions(query);
            eventBus.emit("location:suggestions-delivered", data);
        } catch(error) {
            console.error('Location service fetch error:', error);
            eventBus.emit("location:suggestions-failed", { query, error });
        }
    }

    const handleRecentsRequest = () => {
        eventBus.emit("location:recents-delivered", state.getRecents());
    }

    const handleCurrentLocationRequest = () => {
        eventBus.emit("location:current-delivered", state.getCurrentLocation());
    }

    const handleSwitchToFavourite = (id) => {
        if(!id) return;

        const location = state.getFavouriteLocationById(id);
        if(!location) return;

        state.setCurrentLocation(location);
    }

    const setupEventListeners = () => {
        eventBus.on("location:change-requested", handleLocationChangeRequest);
        eventBus.on("location:switch-to-favourite", handleSwitchToFavourite);
        eventBus.on("location:user-update-requested", handleUserLocationUpdateRequest);
        eventBus.on("location:add-favourite-requested", handleAddToFavouritesRequest);
        eventBus.on("location:add-current-to-favourites-requested", handleAddCurrentToFavouritesRequest);
        eventBus.on("location:remove-favourite-requested", handleRemoveFromFavouritesRequest);
        eventBus.on("location:suggestions-requested", handleAPISuggestionsRequest);
        eventBus.on("location:recents-requested", handleRecentsRequest);
        eventBus.on("location:current-requested", handleCurrentLocationRequest);
    };

    const removeEventListeners = () => {
        eventBus.off("location:change-requested", handleLocationChangeRequest);
        eventBus.off("location:user-update-requested", handleUserLocationUpdateRequest);
        eventBus.off("location:add-favourite-requested", handleAddToFavouritesRequest);
        eventBus.off("location:remove-favourite-requested", handleRemoveFromFavouritesRequest);
        eventBus.off("location:suggestions-requested", handleAPISuggestionsRequest);
        eventBus.off("location:recents-requested", handleRecentsRequest);
        eventBus.off("location:current-requested", handleCurrentLocationRequest);
    };

    const initialize = () => {
        if (isInitialized) return;

        eventManager = createEventManager();
        setupEventListeners();

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        removeEventListeners();
        if (eventManager?.destroy) {
            eventManager.destroy();
        }
        eventManager = null;
        isInitialized = false;
    };

    return {
        initialize,
        destroy,
        get isInitialized() {
            return isInitialized;
        }
    };
};