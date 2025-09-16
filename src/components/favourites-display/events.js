import { createEventManager } from "../../shared/eventManager.js";
import { eventBus } from "../../shared/eventBus.js";
import { favourites as config} from "../../shared/config.js";

export const createEvents = (state, dom) => {
    if (!state || !dom || !config) {
        throw new Error("state, dom, and config are required");
    }

    let elements = null;
    let eventManager = null;
    let isInitialized = false;

    const handleIndexChange = () => {
        if (!elements) return;
        dom.moveItems(state.getCurrentIndex());
        dom.updateClasses();
    };

    const handleNext = () => {
        if (!state.canGoNext()) return;
        state.goToNext();
        handleIndexChange();
    };

    const handlePrevious = () => {
        if (!state.canGoPrevious()) return;
        state.goToPrevious();
        handleIndexChange();
    };

    const getDotIndex = (targetDot) => {
        if (!elements?.dots) return -1;
        return elements.dots.findIndex((dot) => dot === targetDot);
    };

    const handleDotClick = (event) => {
        const dotIndex = getDotIndex(event.target);
        if (dotIndex === -1 || dotIndex === state.getCurrentIndex()) {
            return;
        }

        state.setCurrentIndex(dotIndex);
        handleIndexChange();
    };

    const handleItemButtonClick = (event) => {
        const target = event.target;
        const listItem = target.closest(".favourites__list__item");

        if(!listItem) return;

        const dataId = parseInt(listItem.getAttribute("data-id"));

        if(!dataId) return;

        eventBus.emit("location:switch-to-favourite", dataId);
    }

    const handleAddButtonClick = () => {
        eventBus.emit("current-forecast:requested", (currentForecast) => {
            const processedForecast = state.processForecast(currentForecast);
            if(currentForecast) {
                state.addFavourite(processedForecast);
            }
        });
    }

    const handleFavouriteForecastsChange = (favourites) => {
        if(!favourites) return;

        state.setFavouritesLength(favourites.length);

        favourites = favourites.map(favourite => {
            return state.processForecast(favourite);
        });

        favourites.reverse();

        state.setCurrentIndex(0);
        dom.moveItems(state.getCurrentIndex());
        dom.displayFavourites(favourites);
        dom.updateClasses();

        const itemButtons = dom.getElements().itemButtons;
        itemButtons.forEach(button => {
            eventManager.addEventListener(button, "click", handleItemButtonClick);
        })
    }

    const handleFavouriteForecastsDelivered = (favourites) => {
        handleFavouriteForecastsChange(favourites);
    }

    const handleTemperatureUnitChange = () =>{
        eventBus.emit("weather:favourite-forecasts-requested");
    }

    const setupEventListeners = () => {
        elements = dom.getElements();
        if(!elements) return;

        const addButton = elements.addButton;
        const nextButton = elements.nextButton;
        const previousButtons = elements.previousButtons;
        const nextButtons = elements.nextButtons;
        const dotsContainer = elements.dotsContainer;
        const itemButtons = elements.itemButtons;
        const toggle = elements.toggle;

        eventManager.addEventListener(nextButton, "click", handleNext);

        previousButtons.forEach((previousButton) => {
            eventManager.addEventListener(previousButton, "click", handlePrevious);
        });

        nextButtons.forEach((nextButton) => {
            eventManager.addEventListener(nextButton, "click", handleNext);
        });

        eventManager.addEventListener(dotsContainer, "click", handleDotClick);

        itemButtons.forEach(itemButton => {
            eventManager.addEventListener(itemButton, "click", handleItemButtonClick);
        });

        eventManager.addEventListener(addButton, "click", handleAddButtonClick);

        //listen for favourite forecasts change
        eventBus.on("weather:favourites-changed", handleFavouriteForecastsChange);
        eventBus.on("weather:favourite-forecasts-delivered", handleFavouriteForecastsDelivered);

        //listen for unit change
        eventBus.on("unit:temperature-changed", handleTemperatureUnitChange);
    };

    const removeEventListeners = () => {
        if (!eventManager) return;
        eventManager.removeAllEventListeners();
    };

    const initialize = () => {
        if (isInitialized) return;

        eventManager = createEventManager();
        setupEventListeners();
        eventBus.emit("weather:favourite-forecasts-requested");

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first");
            return;
        }
        removeEventListeners();
        eventManager = null;
        elements = null;
        isInitialized = false;
    };

    return {
        initialize,
        destroy,
        handleNext,
        handlePrevious,
        handleIndexChange,
        get isInitialized() {
        return isInitialized;
        },
    };
};