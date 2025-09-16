export const createConverter = () => {
    const convertTemperature = (value, fromUnit, toUnit) => {
        if (fromUnit === toUnit) return value.toFixed(0);
        
        if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
            return ((value * 9/5) + 32).toFixed(0);
        }
        
        if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
            return ((value - 32) * 5/9).toFixed(0);
        }
        
        return value;
    };

    const convertSpeed = (value, fromUnit, toUnit) => {
        if (fromUnit === toUnit) return value;
        
        if (fromUnit === 'kmh' && toUnit === 'mph') {
            return (value * 0.621371);
        }
        
        if (fromUnit === 'mph' && toUnit === 'kmh') {
            return (value * 1.609344);
        }
        
        return value;
    };

    const formatTemperature = (value, unit = 'celsius', decimals = 0) => {
        const symbol = unit === 'celsius' ? '°C' : '°F';
        return `${Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)}${symbol}`;
    };

    const formatSpeed = (value, unit = 'kmh', decimals = 0) => {
        const symbol = unit === 'kmh' ? 'km/h' : 'mph';
        return `${Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)} ${symbol}`;
    };

    return {
        convertTemperature,
        convertSpeed,
        formatTemperature,
        formatSpeed
    };
};