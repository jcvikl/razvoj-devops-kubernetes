const {getFlash} = require("../helpers/session");
const axios = require("axios").create({baseURL: process.env.API_ENDPOINT, timeout: 5000});

const login = async (req, res) => {
    const message = getFlash(req, "message", "");
    const messageClass = getFlash(req, "messageClass", "");

    res.render("users/login", {title: "User Login", req: req, message: message, messageClass: messageClass});
};

const doLogin = async (req, res) => {
    const title = "User Login";
    if (!req.body.email || !req.body.password) {
        return res.render("users/login", {
            title: title,
            message: "All fields are required!",
            messageClass: "alert-danger",
            req: req
        });
    }

    try {
        const apiRes = await axios.post("/api/users/login", {
            email: req.body.email,
            password: req.body.password
        });

        res.cookie("token", apiRes.data.token);
        res.redirect("/users/profile");
    } catch (err) {
        res.render("users/login", {
            title: title,
            message: err.response.data.message,
            messageClass: "alert-danger",
            req: req
        });
    }
};

const register = async (req, res) => {
    res.render("users/register", {title: "User Registration", req: req});
};

const doRegister = async (req, res) => {
    const title = "User Registration";
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.render("users/register", {title: title, message: "All fields are required!", req: req});
    }

    try {
        await axios.post("/api/users/register", {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        req.session.message = "Registration successful! Please, login!";
        req.session.messageClass = "alert-success";

        res.redirect("/users/login");
    } catch (err) {
        res.render("users/register", {title: title, message: err.response.data.message, req: req});
    }
};

const profile = async (req, res) => {
    if (!req.auth) {
        return res.redirect("/users/login");
    }

    res.render("users/profile", {name: req.auth.name, req: req});
};

const logout = async (req, res) => {
    req.session.regenerate(function (err) {
        console.log("Session", err);
    });
    res.clearCookie("token");
    res.redirect("/");
};

module.exports = {
    login,
    doLogin,
    register,
    doRegister,
    profile,
    logout
};