export const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => reject(error),
            { enableHighAccuracy: true, 
              maximumAge: Infinity}
        );
    });
};

export const getUserLocation = async () => {
    try {
        const location = await getCurrentPosition();
        console.log("Current user location:", location);
        return location;
    } catch (error) {
        console.error("Error caught getting user location:", error);
    }
};