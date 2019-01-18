function insDefault(value, defaultValue, rootType) {
    return value instanceof rootType && value || defaultValue
}

function typeDefault(value, defaultValue, type) {
    return (type == null || typeof value === type) && value || defaultValue
}

module.exports = {
    insDefault,
    typeDefault
}