const axios = require("axios").create({baseURL: process.env.API_ENDPOINT, timeout: 5000});
const {authToken} = require("../helpers/auth");
const {getFlash} = require("../helpers/session");

const index = async (req, res) => {
    const title = "My Types";
    let message = getFlash(req, "message", "");
    let messageClass = getFlash(req, "messageClass", "");
    let types = [];

    try {
        const apiRes = await axios.get("/api/types", {
            headers: authToken(req),
        })

        types = apiRes.data
    } catch (err) {
        message = err.message;
        messageClass = "alert-danger";
    } finally {
        res.render("types/index", {
            title: title,
            types: types,
            message: message,
            messageClass: messageClass,
            req: req,
            isEmpty: types.length === 0
        });
    }
};

const create = async (req, res) => {
    res.render("types/edit", {title: "Add new type", req: req})
};

const doCreate = async (req, res) => {
    if (!req.body.title || !req.body.borrowDays) {
        return res.render("types/edit", {
            title: "Add new type",
            req: req,
            form: req.body,
            message: "Missing required fields!"
        })
    }

    const borrowDays = parseInt(req.body.borrowDays);
    if (isNaN(borrowDays) || borrowDays < 1 || borrowDays > 90) {
        return res.render("types/edit", {
            title: "Add new type",
            req: req,
            form: req.body,
            message: "Borrow Days is invalid (1-90)!"
        })
    }

    try {
        await axios.post("/api/types", req.body, {
            headers: authToken(req)
        });

        res.redirect("/types");
    } catch (err) {
        res.render("types/edit", {
            title: "Add new type",
            req: req,
            form: req.body,
            message: err.message
        });
    }
};

const update = async (req, res) => {
    let message = "";
    let data = {};

    try {
        const apiRes = await axios.get("/api/types/" + req.params.id, {
            headers: authToken(req)
        });

        data = apiRes.data;
    } catch (err) {
        message = err.message;
        data = {};
    } finally {
        res.render("types/edit", {title: "Update type", req: req, form: data, id: req.params.id, message: message})
    }
}

const doUpdate = async (req, res) => {
    if (!req.body.title || !req.body.borrowDays) {
        return res.render("types/edit", {
            title: "Update type",
            req: req,
            form: req.body,
            message: "Missing required fields!"
        });
    }

    const borrowDays = parseInt(req.body.borrowDays);
    if (isNaN(borrowDays) || borrowDays < 1 || borrowDays > 90) {
        return res.render("types/edit", {
            title: "Update type",
            req: req,
            form: req.body,
            message: "Borrow Days is invalid (1-90)!"
        });
    }

    try {
        await axios.put("/api/types/" + req.params.id, req.body, {
            headers: authToken(req)
        });

        res.redirect("/types");
    } catch (err) {
        res.render("types/edit", {
            title: "Update type",
            req: req,
            form: req.body,
            message: err.message
        });
    }
}

const remove = async (req, res) => {
    try {
        await axios.delete("/api/types/" + req.params.id, {
            headers: authToken(req)
        });
    } catch (err) {
        req.session.message = err.response.data.message;
        req.session.messageClass = "alert-danger";
    } finally {
        res.redirect("/types")
    }
}

module.exports = {
    index,
    create,
    doCreate,
    update,
    doUpdate,
    remove
};