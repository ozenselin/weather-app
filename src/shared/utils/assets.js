const baseIconUrl = "./assets/weather-icons/"
export const getIconPath = (iconName) => {
    if(!iconName) return;
    return `${baseIconUrl}${iconName}.png`;
}

const baseBackgroundUrl = "./assets/backgrounds/"
export const getBackgroundPath = (iconName) => {
    if(!iconName) return;
    return `${baseBackgroundUrl}${iconName}.webp`;
}