const getFlash = (req, name, defaultValue = undefined) => {
    if (!req.session || !req.session[name]) {
        return undefined;
    }

    const value = req.session[name] || defaultValue;
    req.session[name] = undefined;
    return value;
}

module.exports = {
    getFlash
}