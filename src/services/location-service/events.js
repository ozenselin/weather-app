import { createEventManager } from "../../shared/eventManager.js";
import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

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

    const handleUserLocationChangeRequest = (newUserLocation) => {
        state.setUserLocation(newUserLocation);
    };

    const handleAddToFavouritesRequest = (location) => {
        state.addFavouriteLocation(location);
    };

    const handleRemoveFromFavouritesRequest = (locationId) => {
        state.removeFavouriteLocation(locationId);
    };

    const setupEventListeners = () => {
        eventBus.on("location:change-requested", handleLocationChangeRequest);
        eventBus.on("location:user-change-requested", handleUserLocationChangeRequest);
        eventBus.on("location:add-favourite-requested", handleAddToFavouritesRequest);
        eventBus.on("location:remove-favourite-requested", handleRemoveFromFavouritesRequest);
    };

    const removeEventListeners = () => {
        eventBus.off("location:change-requested", handleLocationChangeRequest);
        eventBus.off("location:user-change-requested", handleUserLocationChangeRequest);
        eventBus.off("location:add-favourite-requested", handleAddToFavouritesRequest);
        eventBus.off("location:remove-favourite-requested", handleRemoveFromFavouritesRequest);
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