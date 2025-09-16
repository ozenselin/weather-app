import { createEventManager } from "../../shared/eventManager.js";
import { eventBus } from "../../shared/eventBus.js";
import { config } from "../../shared/config.js";

export const createEvents = (state, converter) => {
    if (!state || !eventBus || !config || !converter) {
        throw new Error("state, event bus, converter, and config are required");
    }

    let eventManager = null;
    let isInitialized = false;

    const handleTemperatureToggleRequest = () => {
        state.toggleTemperatureUnit();
    };

    const handleSpeedToggleRequest = () => {
        state.toggleSpeedUnit();
    };

    const handleSystemToggleRequest = () => {
        state.toggleSystem();
    };

    const handleTemperatureSetRequest = (unit) => {
        state.setTemperatureUnit(unit);
    };

    const handleSpeedSetRequest = (unit) => {
        state.setSpeedUnit(unit);
    };

    const convertTemperature = (value, fromUnit = null, toUnit = null) => {
        const from = fromUnit || 'celsius';
        const to = toUnit || state.getTemperatureUnit();
        return converter.convertTemperature(value, from, to);
    };

    const convertSpeed = (value, fromUnit = null, toUnit = null) => {
        const from = fromUnit || 'km/h';
        const to = toUnit || state.getSpeedUnit();
        return converter.convertSpeed(value, from, to);
    };

    const getCurrentUnits = () => ({
        temperature: state.getTemperatureUnit(),
        speed: state.getSpeedUnit(),
        isImperial: state.getIsImperial()
    });

    const handleUnitsRequest = () => {
        const units = getCurrentUnits();
        eventBus.emit("unit:units-delivered", units);
    }

    const handleDisplayTemperatureRequest = ({value, fromUnit, toUnit, element}) => {
        element.textContent = convertTemperature(value, fromUnit, toUnit);
    }

    const handleDisplaySpeedRequest = ({value, fromUnit, toUnit, element}) => {
        element.textContent = convertSpeed(value, fromUnit, toUnit);
    }

    const handleDisplayTemperatureUnitRequest = ({element}) => {
        element.textContent = state.getTemperatureUnit();
    }

    const handleDisplaySpeedUnitRequest = ({element}) => {
        element.textContent = state.getSpeedUnit();
    }

    const handleTemperatureAssignmentRequest = ({value, fromUnit, toUnit, respond}) => {
        const convertedTemperature = convertTemperature(value, fromUnit, toUnit);
        respond(convertedTemperature);
    }

    const handleSpeedAssignmentRequest = ({value, fromUnit, toUnit, respond}) => {
        const convertedSpeed = convertSpeed(value, fromUnit, toUnit);
        respond(convertedSpeed);
    }

    const handleSpeedUnitRequest = (respond) => {
        const speedUnit = state.getSpeedUnit();
        respond(speedUnit);
    }

    const handleTemperatureUnitRequest = (respond) => {
        const temperatureUnit = state.getTemperatureUnit();
        respond(temperatureUnit);
    }

    const handleSystemRequest = (respond) => {
        const isImperial = state.getIsImperial();
        if(isImperial) respond("imperial");
        respond("metric");
    }

    const setupEventListeners = () => {
        eventBus.on("unit:toggle-temperature-requested", handleTemperatureToggleRequest);
        eventBus.on("unit:toggle-speed-requested", handleSpeedToggleRequest);
        eventBus.on("unit:toggle-system-requested", handleSystemToggleRequest);

        //display requests
        eventBus.on("unit:display-temperature-requested", handleDisplayTemperatureRequest);
        eventBus.on("unit:display-speed-requested", handleDisplaySpeedRequest);
        eventBus.on("unit:display-speed-unit-requested", handleDisplaySpeedUnitRequest);

        //unit & system requests (respond requests)
        eventBus.on("unit:units-requested", handleUnitsRequest);
        eventBus.on("unit:speed-unit-requested", handleSpeedUnitRequest);
        eventBus.on("unit:temperature-unit-requested", handleTemperatureUnitRequest);
        eventBus.on("unit:system-requested", handleSystemRequest);


        //respond requests (responde requests)
        eventBus.on("unit:temperature-assignment-requested", handleTemperatureAssignmentRequest)
        eventBus.on("unit:speed-assignment-requested", handleSpeedAssignmentRequest)
    };

    const removeEventListeners = () => {
        eventBus.off("unit:toggle-temperature-requested", handleTemperatureToggleRequest);
        eventBus.off("unit:toggle-speed-requested", handleSpeedToggleRequest);
        eventBus.off("unit:toggle-system-requested", handleSystemToggleRequest);
        eventBus.off("unit:set-temperature-requested", handleTemperatureSetRequest);
        eventBus.off("unit:set-speed-requested", handleSpeedSetRequest);

        //display requests
        eventBus.off("unit:display-temperature-requested", handleDisplayTemperatureRequest);
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