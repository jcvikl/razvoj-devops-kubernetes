const {getFlash} = require("../helpers/session");
const moment = require("moment/moment");
const {authToken} = require("../helpers/auth");
const axios = require("axios").create({baseURL: process.env.API_ENDPOINT, timeout: 5000});

const index = async (req, res) => {
    let reports = {
        myTypes: [],
        myMostBorrowedItems: []
    };
    let message = getFlash(req, "message", "")
    let messageClass = getFlash(req, "messageClass", "")

    try {
        reports = (await axios.get("/api/reports", {
            headers: authToken(req),
        })).data;

        reports.myMostBorrowedItems.sort((d1, d2) => d2.counterBorrowed - d1.counterBorrowed);
    } catch (err) {
        message = err.response.data.message;
        messageClass = "alert-danger";
    } finally {
        res.render("reports/index", {
            title: "Reports",
            reports: reports,
            isMyTypesEmpty: reports.myTypes.length === 0,
            isMyItemsEmpty: reports.myMostBorrowedItems.length === 0,
            req: req,
            message: message,
            messageClass: messageClass
        })
    }
};

module.exports = {
    index
};