// app.js - Main Application Entry Point
import { createLocationService } from "./services/location-service/index.js";
import { createWeatherService } from "./services/weather-service/index.js";
import { createShowcase } from "./components/showcase/index.js";
import { createChart } from "./components/chart/index.js";
import { createWeeklyForecast } from "./components/weekly-forecast/index.js";
import { createSearchBar } from "./components/search-bar/index.js";
import { createUnitService } from "./services/unit-service/index.js";
import { createUnitToggle } from "./components/unit-toggle/index.js";
import { createFavouritesDisplay } from "./components/favourites-display/index.js";
import { createFavouritesButton } from "./components/favourites-button/index.js";

//import stylesheet
import "./style.css";

export const createApp = () => {
    let isInitialized = false;
    
    //services
    let unitService = null;
    let locationService = null;
    let weatherService = null;

    //components
    let showcase = null;
    let chart = null;
    let weeklyForecast = null;
    let searchBar = null;
    let unitToggle = null;
    let favouritesDisplay = null;
    let favouritesButton = null;

    const initialize = () => {
        if(isInitialized) return;

        //create services
        unitService = createUnitService();
        locationService = createLocationService();
        weatherService = createWeatherService();

        //create components
        showcase = createShowcase();
        chart = createChart();
        weeklyForecast = createWeeklyForecast();
        searchBar = createSearchBar();
        unitToggle = createUnitToggle();
        favouritesDisplay = createFavouritesDisplay();
        favouritesButton = createFavouritesButton();

        //initialize services
        unitService.initialize();
        weatherService.initialize();
        locationService.initialize();

        //initialize components
        showcase.initialize();
        chart.initialize();
        weeklyForecast.initialize();
        searchBar.initialize();
        unitToggle.initialize();
        favouritesDisplay.initialize();
        favouritesButton.initialize();

        isInitialized = true;
    }

    const destroy = () => {
        if(isInitialized) {
            console.log("Must call initialize() first");
            return;
        }

        //destroy components
        if(showcase?.destroy) showcase.destroy();
        if(chart?.destroy) chart.destroy();
        if(weeklyForecast?.destroy()) weeklyForecast.destroy();
        if(searchBar?.destroy) searchBar.destroy();
        if(unitToggle?.destroy()) unitToggle.destroy();
        if(favouritesDisplay?.destroy()) favouritesDisplay.destroy();
        if(favouritesButton?.destroy()) favouritesButton.destroy();

        //destroy services
        if(weatherService?.destroy) weatherService.destroy();
        if(locationService?.destroy) locationService.destroy();
        if(unitService?.destroy) unitService.destroy();

        showcase = null;
        chart = null;
        weeklyForecast = null;
        searchBar = null;
        unitToggle = null;
        favouritesDisplay = null;
        favouritesButton = null;
        
        weatherService = null;
        locationService = null;
        unitService = null;

        isInitialized = false;
    }

    return {
        initialize,
        destroy,
    }
}

const app = createApp();
app.initialize();