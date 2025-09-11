import { createState } from "./state.js";
import { createEvents } from "./events.js";
import { createAPI } from "./api.js";

export const createLocationService = () => {
    let state = null;
    let events = null;
    let api = null;
    let isInitialized = false;

    const initialize = () => {
        if (isInitialized) return;

        // Create modules
        state = createState();
        api = createAPI();
        events = createEvents(state);

        // Initialize in correct order
        state.initialize();
        api.initialize();
        events.initialize();
        const location = state.getCurrentLocation();
        console.log("*************CURRENT LOCAITON-**********",location);
        console.log("*************USER LOCAITON-**********",state.getUserLocation());


        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        // Destroy in reverse order
        if (events?.destroy) events.destroy();
        if (api?.destroy) api.destroy();
        if (state?.destroy) state.destroy();

        events = null;
        api = null;
        state = null;
        isInitialized = false;
    };

    // Public API methods - Location state
    const getCurrentLocation = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return null;
        }
        return state.getCurrentLocation();
    };

    const setCurrentLocation = (newLocation) => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }
        state.setCurrentLocation(newLocation);
    };

    const getRecents = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return [];
        }
        return state.getRecents();
    };

    const getFavourites = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return [];
        }
        return state.getFavourites();
    };

    const getUserLocation = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return null;
        }
        return state.getUserLocation();
    };

    const addFavouriteLocation = (location) => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }
        state.addFavouriteLocation(location);
    };

    const removeFavouriteLocation = (locationId) => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }
        state.removeFavouriteLocation(locationId);
    };

    const clearRecents = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }
        state.clearRecents();
    };

    const clearFavourites = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }
        state.clearFavourites();
    };

    const getRecentLocationById = (itemId) => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return null;
        }
        return state.getRecentLocationById(itemId);
    };

    const getFavouriteLocationById = (itemId) => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return null;
        }
        return state.getFavouriteLocationById(itemId);
    };

    // Public API methods - Location API
    const fetchLocationSuggestions = async (query) => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return [];
        }
        return api.fetchLocationSuggestions(query);
    };

    const fetchLocationSuggestionsByCoords = async (latitude, longitude) => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return [];
        }
        return api.fetchLocationSuggestionsByCoords(latitude, longitude);
    };

    const fetchLocationSuggestionsByName = async (name) => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return [];
        }
        return api.fetchLocationSuggestionsByName(name);
    };

    const fetchLocationSuggestionsByQuery = async (query) => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return [];
        }
        return api.fetchLocationSuggestionsByQuery(query);
    };

    return {
        // Core functionality
        initialize,
        destroy,

        // Location state methods
        getCurrentLocation,
        setCurrentLocation,
        getRecents,
        getFavourites,
        getUserLocation,
        addFavouriteLocation,
        removeFavouriteLocation,
        clearRecents,
        clearFavourites,
        getRecentLocationById,
        getFavouriteLocationById,

        // Location API methods
        fetchLocationSuggestions,
        fetchLocationSuggestionsByCoords,
        fetchLocationSuggestionsByName,
        fetchLocationSuggestionsByQuery,

        get isInitialized() {
            return isInitialized;
        }
    };
};