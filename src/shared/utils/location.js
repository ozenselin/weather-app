const createFullName = ({name, region, country}) => {
    let fullName = name;
    if(region && !region.includes(name)) {
        fullName +=  ", " + region;
    }
    if(country) {
        fullName += ", " + country;
    }
    return fullName;
}

export {
    createFullName,
}