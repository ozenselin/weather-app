# Weather App

A weather app built with plain JavaScript that shows how far the web platform can go without extra tools. 
No frameworks, no clutter. Just **clear architecture**, **solid design choices**.

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

### Breaking Down the Pattern

#### 1. index.js – The Factory
Handles setup and teardown for each component and exposes the public API.

#### 2. events.js – The Event Hub  
Listens for signals and sends updates where needed. Keeps communication clean.

#### 3. state.js – Data Keeper  
Stores current information, makes sure changes are saved and shared safely.

#### 4. api.js – Talking to the Outside World  
Deals with external APIs, including retries and error handling.

#### 5. dom.js – Drawing on the Screen  
Updates the interface, renders changes, and keeps the view fresh.

### Why This Pattern Works  

**Clear separation of concerns**: each file has one job.  
**Consistent lifecycle**: every part has setup and cleanup steps.  
**Predictable dependencies**: services depend on state, events, and API, while modules depend on DOM and events.  

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
