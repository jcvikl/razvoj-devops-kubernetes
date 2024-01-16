const express = require("express");
const router = express.Router();

const ctrlUsers = require("../controllers/users");
const ctrlItems = require("../controllers/items");
const ctrlCatalog = require("../controllers/catalog");
const ctrlTypes = require("../controllers/types");
const ctrlReports = require("../controllers/reports");
const ctrlBorrowedItems = require("../controllers/borrowed_items");
const {requireAuth} = require("../../hbs/helpers/auth");

/**
 * Users
 */
router.route("/users/register")
    .post(ctrlUsers.register);
router.route("/users/login")
    .post(ctrlUsers.login);
router.route("/users/info")
    .post(ctrlUsers.info);

/**
 * Borrowed items
 */
router.route("/borrowed-items")
    .get(requireAuth, ctrlBorrowedItems.list)

/**
 * Types
 */
router.route("/types")
    .get(requireAuth, ctrlTypes.list)
    .post(requireAuth, ctrlTypes.create);
router.route("/types/:id")
    .get(requireAuth, ctrlTypes.get)
    .put(requireAuth, ctrlTypes.update)
    .delete(requireAuth, ctrlTypes.remove);

/**
 * Items
 */
router.route("/items")
    .get(requireAuth, ctrlItems.list)
    .post(requireAuth, ctrlItems.create);
router.route("/items/:id")
    .get(requireAuth, ctrlItems.get)
    .put(requireAuth, ctrlItems.update)
    .delete(requireAuth, ctrlItems.remove);
router.route("/items/:id/borrow")
    .post(requireAuth, ctrlItems.borrow)
    .delete(requireAuth, ctrlItems.returnBack);

/**
 * Reports
 */
router.route("/reports")
    .get(requireAuth, ctrlReports.generate);

/**
 * Catalog
 */
router.route("/catalog")
    .get(ctrlCatalog.list)
    .post(ctrlCatalog.search);
router.route("/catalog/:id")
    .get(ctrlCatalog.get);
router.route("/catalog/:id/borrow")
    .post(ctrlCatalog.borrow);

module.exports = router;
