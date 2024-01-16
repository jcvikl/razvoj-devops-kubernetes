const axios = require("axios").create({baseURL: process.env.API_ENDPOINT, timeout: 5000});
const {authToken} = require("../helpers/auth");
const {getFlash} = require("../helpers/session");
const moment = require("moment");

const getTypes = async (req) => {
    return (await axios.get("/api/types", {
        headers: authToken(req)
    })).data;
};

const index = async (req, res) => {
    const title = "My Items";
    let message = getFlash(req, "message", "");
    let messageClass = getFlash(req, "messageClass", "");
    let items = [];

    try {
        items = (await axios.get("/api/items", {
            headers: authToken(req),
        })).data;

        items = items.map((item) => {
            item.available = item.status === "available";
            item.borrowed = item.status === "borrowed";

            return item;
        });
    } catch (err) {
        message = err.message;
        messageClass = "alert-danger";
    } finally {
        res.render("items/index", {
            title: title,
            items: items,
            message: message,
            messageClass: messageClass,
            req: req,
            isEmpty: items.length === 0
        })
    }
};

const create = async (req, res) => {
    let types = [];

    try {
        types = await getTypes(req);
    } catch (err) {
        req.session.message = err.message;
        req.session.messageClass = "alert-danger";

        return res.redirect("/items");
    }

    res.render("items/edit", {title: "Add new item", req, types});
};

const doCreate = async (req, res) => {
    let types = [];

    try {
        types = await getTypes(req);
    } catch (err) {
        req.session.message = err.message;
        req.session.messageClass = "alert-danger";

        return res.redirect("/items");
    }

    types = types.map((value) => {
        value.selected = req.body.type === value._id;
        return value;
    });

    if (!req.body.type || !req.body.title || !req.body.author || !req.body.description || !req.body.status || !req.body.keywords) {
        return res.render("items/edit", {
            title: "Add new item",
            types: types,
            req: req,
            form: {
                available: req.body.status === "available",
                borrowed: req.body.status === "borrowed",
                ...req.body
            },
            message: "Missing required fields!"
        });
    }

    try {
        await axios.post("/api/items", req.body, {
            headers: authToken(req)
        });

        req.session.message = "Item added!";
        req.session.messageClass = "alert-success";

        res.redirect("/items");
    } catch (err) {
        res.render("items/edit", {
            title: "Add new item",
            types: types,
            req: req,
            form: {
                available: req.body.status === "available",
                borrowed: req.body.status === "borrowed",
                ...req.body
            },
            message: err.message
        })
    }
};

const update = async (req, res) => {
    let types = [];

    try {
        types = await getTypes(req);
    } catch (err) {
        req.session.message = err.message;
        req.session.messageClass = "alert-danger";

        return res.redirect("/items");
    }

    let message = "";
    let item = {};

    try {
        item = (await axios.get("/api/items/" + req.params.id, {
            headers: authToken(req)
        })).data;
    } catch (err) {
        message = err.message;
        item = {};
    } finally {
        types = types.map((value) => {
            value.selected = item.itemType === value._id;
            return value;
        });

        res.render("items/edit", {
            title: "Update item",
            types: types,
            req: req,
            form: {
                available: item.status === "available",
                borrowed: item.status === "borrowed",
                ...item
            },
            message: message,
            id: req.params.id
        })
    }
}

const doUpdate = async (req, res) => {
    let types = [];

    try {
        types = await getTypes(req);
    } catch (err) {
        req.session.message = err.message;
        req.session.messageClass = "alert-danger";

        return res.redirect("/items");
    }

    types = types.map((value) => {
        value.selected = req.body.type === value._id;
        return value;
    });

    if (!req.body.type || !req.body.title || !req.body.author || !req.body.description || !req.body.status || !req.body.keywords) {
        return res.render("items/edit", {
            title: "Add new item",
            types: types,
            req: req,
            form: {
                available: req.body.status === "available",
                borrowed: req.body.status === "borrowed",
                ...req.body
            },
            message: "Missing required fields!"
        });
    }

    try {
        await axios.put("/api/items/" + req.params.id, req.body, {
            headers: authToken(req)
        });
        res.redirect("/items");
    } catch (err) {
        res.render("items/edit", {
            title: "Update item",
            req: req,
            form: {
                available: req.body.status === "available",
                borrowed: req.body.status === "borrowed",
                ...req.body
            },
            types: types,
            message: err.message
        })
    }
}

const remove = async (req, res) => {
    try {
        await axios.delete("/api/items/" + req.params.id, {
            headers: authToken(req)
        })

        req.session.message = "Item deleted!";
        req.session.messageClass = "alert-success";
    } catch (err) {
        req.session.message = err.message;
        req.session.messageClass = "alert-danger";
    } finally {
        res.redirect("/items")
    }
}

const borrow = async (req, res) => {
    let message = "";
    let messageClass = "";
    let item = {};

    try {
        item = (await axios.get("/api/items/" + req.params.id, {
            headers: authToken(req)
        })).data;
    } catch (err) {
        message = err.message;
        messageClass = "alert-danger";
        item = {};
    } finally {
        res.render("items/borrow", {
            title: "Borrow '" + item.title + "'",
            req: req,
            message: message,
            messageClass: messageClass,
            id: req.params.id
        });
    }
}

const doBorrow = async (req, res) => {
    let item = {};

    try {
        item = (await axios.get("/api/items/" + req.params.id, {
            headers: authToken(req)
        })).data;
    } catch (err) {
        req.session.message = err.response.data.message;
        req.session.messageClass = "alert-danger";

        return res.redirect("/items");
    }

    if (!req.body.name) {
        return res.render("items/borrow", {
            title: "Borrow '" + item.title + "'",
            id: req.params.id,
            req: req,
            form: req.body,
            message: "Missing required fields!"
        });
    }

    try {
        await axios.post("/api/items/" + req.params.id + "/borrow", req.body, {
            headers: authToken(req)
        });

        req.session.message = "'" + item.title + "' has been borrowed!";
        req.session.messageClass = "alert-success";

        res.redirect("/items");
    } catch (err) {
        res.render("items/borrow", {
            req: req,
            id: req.params.id,
            message: err.response.data.message,
            messageClass: "alert-danger"
        });
    }
}

const returnBack = async (req, res) => {
    let item = {};

    try {
        item = (await axios.get("/api/items/" + req.params.id, {
            headers: authToken(req)
        })).data;
    } catch (err) {
        req.session.message = err.response.data.message;
        req.session.messageClass = "alert-danger";

        return res.redirect("/items");
    }

    try {
        await axios.delete("/api/items/" + req.params.id + "/borrow", {
            headers: authToken(req)
        });

        req.session.message = "'" + item.title + "' has been returned!";
        req.session.messageClass = "alert-success";

        res.redirect("/items");
    } catch (err) {
        req.session.message = err.response.data.message;
        req.session.messageClass = "alert-danger";

        return res.redirect("/items");
    }
}

const history = async (req, res) => {
    let item = {};
    let histories = [];

    try {
        item = (await axios.get("/api/items/" + req.params.id, {
            headers: authToken(req)
        })).data;

        histories = item.histories;
    } catch (err) {
        req.session.message = err.response.data.message;
        req.session.messageClass = "alert-danger";

        return res.redirect("/items");
    }

    histories = histories.map((history) => {
        history.date = moment(history.createdOn).format("DD.MM.YYYY HH:mm:ss");

        return history;
    });

    res.render("items/history", {title: "History for '" + item.title + "'", req: req, histories: histories});
}

module.exports = {
    index,
    create,
    doCreate,
    update,
    doUpdate,
    remove,
    borrow,
    doBorrow,
    returnBack,
    history
};