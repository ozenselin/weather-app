// app.js - Main Application Entry Point
import { createLocationService } from "./services/location-service/index.js";
import { createWeatherService } from "./services/weather-service/index.js";
// import { createShowcase } from "./components/showcase/index.js";
// import { createChart } from "./components/chart/index.js";
// import { createWeeklyForecast } from "./components/weekly-forecast/index.js";
import { createSearchBar } from "./components/search-bar/index.js";
// import { createUnitToggle } from "./components/unit-toggle/index.js";

export const createApp = () => {
    let isInitialized = false;
    
    //services
    let locationService = null;
    let weatherService = null;

    //components
    let showcase = null;
    let chart = null;
    let weeklyForecast = null;
    let searchBar = null;
    let unitToggle = null;

    const initialize = () => {
        if(isInitialized) return;

        //create services
        locationService = createLocationService();
        weatherService = createWeatherService();

        //create components
        // showcase = createShowcase();
        // chart = createChart();
        // weeklyForecast = createWeeklyForecast();
        searchBar = createSearchBar();
        // unitToggle = createUnitToggle();

        //initialize services
        locationService.initialize();
        weatherService.initialize();

        //initialize components
        // showcase.initialize();
        // chart.initialize();
        // weeklyForecast.initialize();
        searchBar.initialize();
        // unitToggle.initialize();

        isInitialized = true;
    }

    const destroy = () => {
        if(isInitialized) {
            console.log("Must call initialize() first");
            return;
        }

        //destroy components
        // if(showcase?.destroy()) showcase?.destroy();
        // if(chart?.destroy()) chart?.destroy();
        // if(weeklyForecast?.destroy()) weeklyForecast?.destroy();
        if(searchBar?.destroy()) searchBar?.destroy();
        // if(unitToggle?.destroy()) unitToggle?.destroy();

        //destroy services
        if(locationService?.destroy()) locationService?.destroy();
        if(weatherService?.destroy()) weatherService?.destroy();

        // showcase = null;
        // chart = null;
        // weeklyForecast = null;
        searchBar = null;
        // unitToggle = null;
        
        locationService = null;
        weatherService = null;

        isInitialized = false;
    }

    return {
        initialize,
        destroy,
    }
}

const app = createApp();
app.initialize();