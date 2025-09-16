import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createState = () => {
    if (!config || !eventBus) {
        throw new Error("config and event bus are required");
    }

    const STORAGE_KEY = 'weather-app-units';

    let isInitialized = false;

    //Imperial system: fahrenheit, miles, ounces..,
    //Metric system: celcius, kilometer, grams...
    let temperatureUnit = 'celsius'; // celsius | fahrenheit
    let speedUnit = 'km/h'; // km/h | mph
    let isImperial = false; 


    const setTemperatureUnit = (unit) => {
        if(!unit) return;
        const sanitizedUnit = unit.trim().toLowerCase();
        if (sanitizedUnit !== 'celsius' && sanitizedUnit !== 'fahrenheit') return;
        temperatureUnit = sanitizedUnit;
        isImperial = sanitizedUnit === 'fahrenheit';
        saveUnits();
        eventBus.emit("unit:temperature-changed", temperatureUnit);
        eventBus.emit("unit:system-changed", isImperial);
    };

    const setSpeedUnit = (unit) => {
        if(!unit) return;
        const sanitizedUnit = unit.trim().toLowerCase();
        if (sanitizedUnit !== 'km/h' && sanitizedUnit !== 'mph') return;
        speedUnit = sanitizedUnit;
        saveUnits();
        eventBus.emit("unit:speed-changed", speedUnit);
    };

    const toggleTemperatureUnit = () => {
        const newUnit = temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        setTemperatureUnit(newUnit);
    };

    const toggleSpeedUnit = () => {
        const newUnit = speedUnit === 'km/h' ? 'mph' : 'km/h';
        setSpeedUnit(newUnit);
    };

    const toggleSystem = () => {
        if (isImperial) {
            setTemperatureUnit('celsius');
            setSpeedUnit('km/h');
        } else {
            setTemperatureUnit('fahrenheit');
            setSpeedUnit('mph');
        }
    };

    const getTemperatureUnit = () => temperatureUnit;
    const getSpeedUnit = () => speedUnit;
    const getIsImperial = () => isImperial;

    const saveUnits = () => {
        try {
            const units = { temperatureUnit, speedUnit, isImperial };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
        } catch (error) {
            console.error("Error saving units", error);
        }
    };

    const loadUnits = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error loading units:', error);
            return null;
        }
    };

    const initialize = () => {
        if (isInitialized) return;

        const units = loadUnits();
        if (units) {
            temperatureUnit = units.temperatureUnit || 'celsius';
            speedUnit = units.speedUnit || 'km/h';
            isImperial = units.isImperial || false;
        }

        // emit initial units
        eventBus.emit("unit:temperature-changed", temperatureUnit);
        eventBus.emit("unit:speed-changed", speedUnit);
        eventBus.emit("unit:system-changed", isImperial);

        isInitialized = true;
    };

    const destroy = () => {
        if (!isInitialized) {
            console.log("Must call initialize() first!");
            return;
        }

        temperatureUnit = 'celsius';
        speedUnit = 'km/h';
        isImperial = false;
        isInitialized = false;
    };

    return {
        initialize,
        destroy,
        setTemperatureUnit,
        setSpeedUnit,
        toggleTemperatureUnit,
        toggleSpeedUnit,
        toggleSystem,
        getTemperatureUnit,
        getSpeedUnit,
        getIsImperial,
        get isInitialized() {
            return isInitialized;
        }
    };
};
