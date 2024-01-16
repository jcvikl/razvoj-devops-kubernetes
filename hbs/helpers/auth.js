const jwt = require("jsonwebtoken");
const axios = require("axios").create({baseURL: process.env.API_ENDPOINT, timeout: 5000});

const authToken = (req) => {
    return {
        "Authorization": "Bearer " + req.cookies.token
    }
}

const parseAuthFromHeader = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next();
    }

    const values = authHeader.split(' ');
    const token = values[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await axios.post("/api/users/info", {
                id: decoded._id
            });

            if (user) {
                req.auth = decoded;
            }
        } catch (err) {

        }
    }

    return next();
}

const parseAuthFromCookie = async (req, res, next) => {
    if (req.auth || !req.cookies.token) {
        return next();
    }

    try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        const user = await axios.post("/api/users/info", {
            id: decoded._id
        });

        if (user) {
            req.auth = decoded;
        }
    } catch (err) {

    }

    return next();
}

const requireAuth = async (req, res, next) => {
    if (!req.auth) {
        return res.status(401).json({message: "Unauthorized"});
    }

    return next();
}

module.exports = {
    authToken,
    parseAuthFromHeader,
    parseAuthFromCookie,
    requireAuth
}