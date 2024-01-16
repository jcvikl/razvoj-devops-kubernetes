const {getFlash} = require("../helpers/session");
const moment = require("moment/moment");
const {authToken} = require("../helpers/auth");
const axios = require("axios").create({baseURL: process.env.API_ENDPOINT, timeout: 5000});

const index = async (req, res) => {
    let catalog = [];
    let message = getFlash(req, "message", "")
    let messageClass = getFlash(req, "messageClass", "")

    try {
        if (req.query.q) {
            catalog = (await axios.post("/api/catalog", {
                searchString: req.query.q
            })).data;
        } else {
            catalog = (await axios.get("/api/catalog")).data;
        }

        catalog = catalog.map((item) => {
            if (req.auth) {
                item.available = item.owner._id !== req.auth._id && item.status === "available";
            } else {
                item.available = item.status === "available";
            }

            item.borrowed = item.status === "borrowed";

            return item;
        });
    } catch (err) {
        console.log(err);
        message = err.response.data.message;
        messageClass = "alert-danger";
    } finally {
        res.render("catalog/index", {
            title: "Catalog",
            isEmpty: catalog.length === 0,
            catalog: catalog,
            req: req,
            message: message,
            messageClass: messageClass
        })
    }
};

const borrow = async (req, res) => {
    let item = {};
    let message = getFlash(req, "message", "")
    let messageClass = getFlash(req, "messageClass", "")

    try {
        item = (await axios.get("/api/catalog/" + req.params.id)).data;
    } catch (err) {
        message = err.response.data.message;
        messageClass = "alert-danger";
    } finally {
        res.render("catalog/borrow", {
            title: "Borrow '" + item.title + "'",
            id: item._id,
            item: item,
            req: req,
            message: message,
            messageClass: messageClass,
            form: {
                name: req.auth?.name,
                returnDate: moment().add(item.itemType.borrowDays, 'days').format("DD.MM.YYYY")
            }
        });
    }
}

const doBorrow = async (req, res) => {
    let item = {};

    try {
        item = (await axios.get("/api/catalog/" + req.params.id, {
            headers: authToken(req)
        })).data;
    } catch (err) {
        req.session.message = err.response.data.message;
        req.session.messageClass = "alert-danger";

        return res.redirect("/catalog");
    }

    if (!req.body.name) {
        return res.render("catalog/borrow", {
            title: "Borrow '" + item.title + "'",
            id: req.params.id,
            req: req,
            form: req.body,
            message: "Missing required fields!"
        });
    }

    try {
        await axios.post("/api/catalog/" + req.params.id + "/borrow", req.body, {
            headers: authToken(req)
        });

        req.session.message = "'" + item.title + "' has been borrowed!";
        req.session.messageClass = "alert-success";

        res.redirect("/catalog");
    } catch (err) {
        res.render("catalog/borrow", {
            req: req,
            id: req.params.id,
            message: err.response.data.message,
            messageClass: "alert-danger"
        });
    }
}

module.exports = {
    index,
    borrow,
    doBorrow
};