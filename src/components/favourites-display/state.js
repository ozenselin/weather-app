import { favourites as config } from "../../shared/config.js";

export const createState = () => {
    if (!config || !Number.isInteger(config.maxItems)) {
        throw new Error("Config with valid maxItems is required");
    }

    const MAX_ITEMS = config.maxItems || 10;

    let isInitialized = false;
    let currentIndex = 0;
    let previousIndex = 0;
    let favouritesLength = 0;

    const setFavouritesLength = (newLength) => {
        favouritesLength = newLength;
    }

    const getFavouritesLength = () => favouritesLength;

    const getCurrentIndex = () => currentIndex;

    const getPreviousIndex = () => previousIndex;

    const getMaxItems = () => MAX_ITEMS;

    const setCurrentIndex = (newIndex) => {
        if (!isValidIndex(newIndex)) {
        return false;
        }
        previousIndex = currentIndex;
        currentIndex = newIndex;
        return true;
    };

    const initialize = () => {
        if(isInitialized) return;
        isInitialized = true;
    }

    const destroy = () => {
        if(!isInitialized) console.log("Must call initialize() first!");
        favourites = null;
        isInitialized = false;
    }

    const goToNext = () => {
        return setCurrentIndex(currentIndex + 1);
    };

    const goToPrevious = () => {
        return setCurrentIndex(currentIndex - 1);
    };

    const canGoNext = () => currentIndex < getFavouritesLength() - 1; 

    const canGoPrevious = () => currentIndex > 0;

    const processForecast = (forecast) => {
        if(!forecast) return;
        return {...(forecast.days?.at(0)), location: forecast.location}
    }

    const isValidIndex = (index) => {
        return Number.isInteger(index) && index >= 0 && index < getFavouritesLength();
    }

    return {
        destroy,
        initialize,
        setFavouritesLength,
        getMaxItems,
        goToNext,
        goToPrevious,
        canGoNext,
        canGoPrevious,
        getCurrentIndex,
        setCurrentIndex,
        getPreviousIndex,
        processForecast,
    };

}
