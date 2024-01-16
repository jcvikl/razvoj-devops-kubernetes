const axios = require("axios").create({baseURL: process.env.API_ENDPOINT, timeout: 5000});
const {authToken} = require("../helpers/auth");
const {getFlash} = require("../helpers/session");
const moment = require("moment");

const index = async (req, res) => {
    const title = "My Borrowed Items";
    let message = getFlash(req, "message", "");
    let messageClass = getFlash(req, "messageClass", "");
    let borrowedItems = [];

    try {
        const apiRes = await axios.get("/api/borrowed-items", {
            headers: authToken(req),
        })

        borrowedItems = apiRes.data.map((entry) => {
            entry.returnUntil = moment(entry.shouldBeReturned).format("DD.MM.YYYY");
            return entry;
        });

        console.log(borrowedItems);
    } catch (err) {
        message = err.message;
        messageClass = "alert-danger";
    } finally {
        res.render("borrowed-items/index", {
            title: title,
            borrowedItems: borrowedItems,
            message: message,
            messageClass: messageClass,
            req: req,
            isEmptyBorrowedItems: borrowedItems.length === 0,
            isHistoryEmpty: true
        });
    }
};

module.exports = {
    index,
};