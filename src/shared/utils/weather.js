export const getWeatherSubtitle = (conditions) => {
    if(!conditions) return;

    if (conditions.length == 1) {
        const title = conditions.at(0).toLowerCase();
        let subtitle = "";
        switch (title) {
            case "mostly sunny":
                subtitle = "Bright with scattered clouds";
                break;
            case "snow":
                subtitle = "Steady Snow falling";
                break;
            case "rain":
                subtitle = "Rain throughout the day";
                break;
            case "overcast":
                subtitle = "Heavy cloud cover";
                break;
            case "partially cloudy":
                subtitle = "Occasional clouds";
                break;
            case "fog":
                subtitle = "Dense fog, low visibility";
                break;
            case "storm":
            case "thunderstorm":
                subtitle = "Powerful Storms approaching";
                break;
            case "clear":
                subtitle = "Perfectly Clear Skies";
                break;
            case "snow-showers-day":
                subtitle = "Snow Showers today";
                break;
            case "snow-showers-night":
                subtitle = "Snow Showers tonight";
                break;
            case "thunder-rain":
                subtitle = "Thunder with Steady rain";
                break;
            case "thunder-showers-day":
                subtitle = "Thunderstorms possible today";
                break;
            case "thunder-showers-night":
                subtitle = "Thunderstorms possible tonight";
                break;
            case "showers-day":
                subtitle = "Showers through the day";
                break;
            case "showers-night":
                subtitle = "Showers through the night";
                break;
            case "wind":
                subtitle = "Strong winds blowing";
                break;
            case "cloudy":
                subtitle = "Clouds dominating the Sky";
                break;
            case "partly-cloudy-day":
                subtitle = "Partial clouds with Sun";
                break;
            case "partly-cloudy-night":
                subtitle = "Partial clouds under stars";
                break;
            case "clear-day":
                subtitle = "Uninterrupted Sunshine";
                break;
            case "clear-night":
                subtitle = "Crisp, Clear Night";
                break;
            default:
                break;
        }
        return subtitle;
    }

    if(conditions.length >= 2) {
        let [first, subtitle] = conditions;
        return subtitle;
    }


};