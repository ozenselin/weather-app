import { createEventManager } from "../../shared/eventManager.js";
import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createEvents = (state, dom) => {
    if (!state || !dom || !config) {
        throw new Error("state, dom, and config are required");
    }

    let elements = null;
    let eventManager = null
    let isInitialized = false;


    const handleForecastChange = ({forecast}) => {
        dom.displayTheWeek(forecast);
    }

    const handleWeekItemClick = (event) => {
        const target = event.target;

        const closest = target.closest(".forecast__list__item");

        if(!closest) return;

        //get day index
        const weekItemIndex = elements.weekItems.indexOf(closest);

        const currentDayIndex = state.getCurrentDayIndex();
        if(currentDayIndex != weekItemIndex) {
            eventBus.emit("weather:day-change-requested", weekItemIndex);
            eventBus.emit("weather:hour-change-requested", null);
        }
    }

    const handleDayChange = ({forecast, dayIndex}) => {
        state.setCurrentDayIndex(dayIndex);
        dom.displayTheWeek(forecast);
    }

    const handleTemperatureUnitChange = () => {
        eventBus.emit("weather:forecast-requested", (weatherState) => {
            const {forecast, dayIndex} = weatherState;
            state.setCurrentDayIndex(dayIndex);
            dom.displayTheWeek(forecast);
        });
    }

    const setupEventListeners = () => {
        //get elements from dom
        const weekItems = elements.weekItems;

        //add dom event listeners
        weekItems.forEach(weekItem => {
            eventManager.addEventListener(weekItem, "click", handleWeekItemClick);
        });

        //add event handlers for event bus (custom events)
        eventBus.on("weather:forecast-changed", handleForecastChange);
        eventBus.on("weather:day-changed", handleDayChange);
        eventBus.on("unit:temperature-changed", handleTemperatureUnitChange);
    }
    
    const initialize = () => {
        if(isInitialized) return;

        elements = dom.getElements();
        eventManager = createEventManager();
        setupEventListeners();

        isInitialized = true;
    }

    const destroy = () => {
        if(!isInitialized) console.log("Must call initialize() first");
        eventManager.removeEventListeners();
        eventManager = null;
        api = null;
        elements = null;
        isInitialized = false;
    }

    return {
        initialize,
        destroy,
        get isInitialized() {
            return isInitialized;
        },
    }
}