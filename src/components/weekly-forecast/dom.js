import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";
import { getIconPath } from "../../shared/utils/assets.js";
import { getFormattedDayShort } from "../../shared/utils/date.js";

export const createDOM = (state) => {
    if (!config || !state || !eventBus) {
        throw new Error("config, state and event bus are required");
    }

    let elements = null;
    let isInitialized = false;

    const cacheElements = () => {
        elements = {
            //weekly forecast
            weekListContainer: document.querySelector(".forecast"),
            weekList: document.querySelector(".forecast__list"),
            weekItem: document.querySelector(".forecast__list__item"),
            weekItems: Array.from(document.querySelectorAll(".forecast__list__item")),
            weekItemBtn : document.querySelector(".forecast__list__item__btn"),
            weekItemDay: document.querySelector(".forecast__list__item__name"),
            weekItemIcon: document.querySelector(".icon forecast__list__item__icon"),
            weekItemHighestTemperature: document.querySelector(".forecast__list__item__temp forecast__list__item__temp--high"),
            weekItemLowestTemperature: document.querySelector(".forecast__list__item__temp forecast__list__item__temp--low"),
        };
    }
    
    const displayTheWeek = (forecast) => {
        if(!forecast) return;

        //get all items as a node list from dom
        const weekItems = elements.weekItems;

        //get days list in forecast data
        const days = forecast.days;

        for(const [index, day] of days.entries()) {
            //get formatted day name
            const dayName = getFormattedDayShort(new Date(day.datetime).getDay()); //Format: Thu, Wed

            //get the current week item in dom
            const weekItem = weekItems[index];

            //update the item with current day information
            updateWeekItem(weekItem, dayName, getIconPath(day.icon), day.tempmax, day.tempmin);
        }
        //when all items are set
        //update classes
        updateWeekItemsClasses();
    }

    const updateWeekItemsClasses = () => {
        const currentDayIndex = state.getCurrentDayIndex();
        const previousDayIndex = state.getPreviousDayIndex();

        const weekItems = elements.weekItems;

        const currentWeekItem = weekItems[currentDayIndex];
        const previousWeekItem = weekItems[previousDayIndex];

        previousWeekItem.classList.remove("forecast__list__item__active", "glass-background");
        currentWeekItem.classList.add("forecast__list__item__active", "glass-background");
    }

    const updateWeekItem = (weekItem, dayName, iconSrc, tempHigh, tempLow) => {
        weekItem.querySelector(".forecast__list__item__name").textContent = dayName;
        weekItem.querySelector(".forecast__list__item__icon").src = iconSrc;

        const tempHighElement = weekItem.querySelector(".forecast__list__item__temp--high__value");
        const tempLowElement = weekItem.querySelector(".forecast__list__item__temp--low__value");

        eventBus.emit("unit:display-temperature-requested", {value: tempHigh, fromUnit: "fahrenheit", element: tempHighElement});
        eventBus.emit("unit:display-temperature-requested", {value: tempLow, fromUnit: "fahrenheit", element: tempLowElement});
    }


    const getElements = () => {
        if(!elements) {
            cacheElements();
        }
        return elements;
    }

    const initialize = () => {
        if(isInitialized) return;
        cacheElements();
        isInitialized = true;
    }

    const destroy = () => {
        if(!isInitialized) console.log("Must call initialize() first!");
        elements = null;
        isInitialized = false;
    }
    
    return {
        initialize,
        destroy,
        getElements,
        displayTheWeek,
        get isInitialized(){
            return isInitialized;
        }
    }
}