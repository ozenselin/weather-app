# Weather App

A weather app built with plain JavaScript that shows how far the web platform can go without extra tools. 
No frameworks, no clutter. Just clear architecture and solid design choices.

## The Big Picture

Instead of relying on a framework, the app is built on simple principles that keep the code robust and clean. 
Services manage the data. Components handle the view. Event bus pattern keep everything in sync. 
The result is a system that feels natural to extend and easy to maintain.

## Live Demo

The GIF below showcases the main features.

![](weather-app-demo.gif)

## Web Preview

The project is hosted on **GitHub Pages**, and you can access it here: 🔗 **[Weather App](https://ozenselin.github.io/weather-app/)**
> Note: Background images may load a bit slowly at first.

## Highlights

### JavaScript in Action  
- **EventBus pattern**: Custom event system that manages subscriptions with ease  
- **Module pattern**: Factory approach for building services and modules in a consistent way  

### Performance at Heart  
- Safe API calls with background refresh when needed
- Careful cleanup of listeners and instances to save memory  
- Optimized WebP images for faster loading  

### Talking to the API  
- Two APIs work together: Visual Crossing for forecasts and WeatherAPI for location search  
- Smart caching keeps forecasts, searches, favourite places, and preferences ready without repeated calls  

## User Experience

### Favourite Places  
- Previously saved favourites (from localStorage) appear immediately, then get refreshed in the background with API calls so the list stays seamless and without empty gaps  
- Navigate through favourites using arrow or indicator buttons, one location at a time
- Selecting a favourite instantly updates the location, weather, weekly grid, and charts  
- Forecasts refresh automatically every 15 minutes without reloading the page  

### Interactions  
- A **chart** section that let the user dive into hourly details  
- A **search bar** with instant **suggestions**  
- A **weekly grid** where selecting a day updates the showcase and charts with an active glass effect  
- A **favourite places carousel** where arrow navigation and item selection instantly refresh the location, weather, weekly grid, and charts  
- A **unit toggle** that allows switching between Celsius/Fahrenheit and km/h/mph with instant updates across the app

### Visual Style  
- **Dynamic backgrounds** that match the weather with smooth transitions  
- Frosted **glass effects** that feel modern and subtle  
- Text that adapts to any screen size  
- Small animations (in carousel) that guide the user’s eye without distraction

## Deep Dive

### Services  
Services are the silent workers of the app. They take care of the heavy lifting so the interface stays smooth.  
- Connect to APIs and try again when something fails  
- Save user choices in localStorage  
- Pass messages across different parts of the app  
- Clean and reshape data before showing it to the user  

### Components  
Components are the face of the app. They bring data to life and make it interactive.  
- Listen for changes from the services  
- Keep their own small slice of state  
- React to user actions in real time  
- Send signals back to the services  

> Conclusion: The idea is simple: services keep the core data, while components handle what the user sees. This balance makes the system easy to grow and easy to debug.

### Event Flow  
When the user taps on a day in the forecast, the story begins. The weekly view asks for details, 
the service fetches fresh data, and the charts and main display update instantly. 
This flow keeps the experience lively and connected.

### Data Flow
```
Location Change → API Call → Data Transform → Event Emission → UI Update
```
Each step is clear, testable, and replaceable.

## How the App is Built

This app shows that vanilla JavaScript can scale. By applying solid architectural principles: separation of concerns, event-driven communication, and modular design, the code becomes
- **Maintainable**: clear boundaries between components
- **Testable**: each service and module can be tested in isolation
- **Extensible**: new modules plug in without touching existing code
- **Performant**: no framework overhead, direct DOM manipulation
- **Educational**: shows fundamental patterns without abstraction


### Breaking down the Module Pattern

#### 1. **index.js** - The Factory (Always Required)
```javascript
// Service Example
export const createLocationService = () => {
    let state = null;
    let events = null;
    let api = null;

    const initialize = () => {
        state = createState();
        events = createEvents(state);
        api = createAPI();
        
        state.initialize();
        events.initialize();
        api.initialize();
    };

    const destroy = () => {
        if (state?.destroy) state.destroy();
        if (events?.destroy) events.destroy();
        if (api?.destroy) api.destroy();
    };

    // Public API
    return {
        initialize,
        destroy,
        getCurrentLocation: () => state.getCurrentLocation(),
        searchLocations: (query) => api.fetchLocationSuggestions(query)
    };
};

// Module Example  
export const createShowcase = () => {
    let dom = null;
    let events = null;
    // No state needed for simple display module

    const initialize = () => {
        dom = createDOM();
        events = createEvents(dom);
        
        dom.initialize();
        events.initialize();
    };

    return { initialize, destroy };
};
```

#### 2. **events.js** - Event Hub (Always Required)
```javascript
// Service Events - Handles external requests
export const createEvents = (state) => {
    const handleLocationChangeRequest = (newLocation) => {
        state.setCurrentLocation(newLocation);
    };

    const setupEventListeners = () => {
        eventBus.on("location:change-requested", handleLocationChangeRequest);
        eventBus.on("location:add-favourite-requested", handleAddFavourite);
    };

    const removeEventListeners = () => {
        eventBus.off("location:change-requested", handleLocationChangeRequest);
        eventBus.off("location:add-favourite-requested", handleAddFavourite);
    };

    return { initialize: setupEventListeners, destroy: removeEventListeners };
};

// Module Events - Listens to service changes
export const createEvents = (dom) => {
    const handleForecastChange = (forecast) => {
        dom.updateForecastData(forecast);
    };

    const setupEventListeners = () => {
        eventBus.on("weather:forecast-changed", handleForecastChange);
        eventBus.on("weather:unit-changed", dom.updateUnit);
    };

    return { initialize: setupEventListeners, destroy: removeEventListeners };
};
```

#### 3. **state.js** - Data Management (Usually Present)
```javascript
// Service State - Domain logic & persistence
export const createState = () => {
    let currentLocation = null;
    let favourites = [];

    const setCurrentLocation = (location) => {
        currentLocation = location;
        localStorage.setItem('current-location', JSON.stringify(location));
        eventBus.emit("location:current-changed", location);
    };

    const getFavourites = () => [...favourites]; // Immutable copy

    return {
        initialize: () => loadFromStorage(),
        destroy: () => { currentLocation = null; favourites = []; },
        setCurrentLocation,
        getCurrentLocation: () => currentLocation ? {...currentLocation} : null,
        getFavourites
    };
};

// Module State - UI state only (optional)
export const createState = () => {
    let chartInstance = null;
    let chartData = null;

    const setChartInstance = (instance) => {
        chartInstance = instance;
    };

    const processChartData = (forecast) => {
        const processedData = transformForecastToChart(forecast);
        chartData = processedData;
        eventBus.emit("chart:data-ready", processedData);
    };

    return {
        initialize: () => {},
        destroy: () => { 
            if (chartInstance) chartInstance.destroy();
            chartInstance = null;
            chartData = null;
        },
        setChartInstance,
        getChartInstance: () => chartInstance,
        processChartData
    };
};
```

#### 4. **api.js** - External Communication (Services Only)
```javascript
export const createAPI = () => {
    const fetchLocationSuggestions = async (query) => {
        try {
            eventBus.emit("location:api-fetch-started", query);
            
            const response = await fetch(buildUrl(query));
            const data = await response.json();
            
            eventBus.emit("location:api-fetch-completed", { query, data });
            return data;
        } catch (error) {
            eventBus.emit("location:api-fetch-failed", { query, error });
            throw error;
        }
    };

    return {
        initialize: () => {},
        destroy: () => {},
        fetchLocationSuggestions
    };
};
```

#### 5. **dom.js** - UI Rendering (Modules Only)
```javascript
export const createDOM = () => {
    let elements = null;
    let currentForecast = null;

    const cacheElements = () => {
        elements = {
            temperature: document.querySelector('.temperature'),
            location: document.querySelector('.location-name')
        };
    };

    const updateForecastData = (forecast) => {
        currentForecast = forecast;
        render();
    };

    const render = () => {
        if (!elements || !currentForecast) return;
        
        elements.temperature.textContent = currentForecast.temp + '°';
        elements.location.textContent = currentForecast.location.name;
    };

    return {
        initialize: () => { cacheElements(); },
        destroy: () => { elements = null; currentForecast = null; },
        updateForecastData,
        render
    };
};
```

### Why This Pattern Works

#### Clear Separation of Concerns
- **index.js**: Orchestration & public interface
- **events.js**: Communication & event handling  
- **state.js**: Data management & business logic
- **api.js**: External integrations (services only)
- **dom.js**: UI rendering (modules only) 

## Installation

```bash
# Clone the repository
git clone https://github.com/username/weather-app

# Serve locally (required for CORS)
python -m http.server 8000
# or
npx serve .

# Open http://localhost:8000
```

## Configuration

Add your API keys to `config.js`:
```javascript
export const config = {
    api: {
        visualCrossing: {
            apiKey: 'your-key-here'
        },
        weatherApi: {
            apiKey: 'your-key-here'
        }
    }
}
```

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for details.
