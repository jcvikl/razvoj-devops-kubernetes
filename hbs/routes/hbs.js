const express = require("express");
const router = express.Router();

const ctrlPublic = require("../controllers/public");
const ctrlUsers = require("../controllers/users");
const ctrlCatalog = require("../controllers/catalog");
const ctrlTypes = require("../controllers/types");
const ctrlItems = require("../controllers/items");
const ctrlReports = require("../controllers/reports");
const ctrlBorrowedItems = require("../controllers/borrowed_items");
const {requireAuth} = require("../helpers/auth");

/**
 * Homepage
 */
router.get("/", ctrlPublic.homepage);

/**
 * User registration, login, profile and logout
 */
router.route("/users/login")
    .get(ctrlUsers.login)
    .post(ctrlUsers.doLogin);
router.route("/users/register")
    .get(ctrlUsers.register)
    .post(ctrlUsers.doRegister);
router.route("/users/profile")
    .get(ctrlUsers.profile);
router.route("/users/logout")
    .get(ctrlUsers.logout);

/**
 * Types
 */
router.route("/types")
    .get(requireAuth, ctrlTypes.index);
router.route("/types/edit")
    .get(requireAuth, ctrlTypes.create)
    .post(requireAuth, ctrlTypes.doCreate);
router.route("/types/edit/:id")
    .get(requireAuth, ctrlTypes.update)
    .post(requireAuth, ctrlTypes.doUpdate);
router.route("/types/delete/:id")
    .get(requireAuth, ctrlTypes.remove);

/**
 * Borrowed items
 */
router.route("/borrowed-items")
    .get(requireAuth, ctrlBorrowedItems.index);

/**
 * Items
 */
router.route("/items")
    .get(requireAuth, ctrlItems.index);
router.route("/items/edit")
    .get(requireAuth, ctrlItems.create)
    .post(requireAuth, ctrlItems.doCreate);
router.route("/items/edit/:id")
    .get(requireAuth, ctrlItems.update)
    .post(requireAuth, ctrlItems.doUpdate);
router.route("/items/delete/:id")
    .get(requireAuth, ctrlItems.remove);
router.route("/items/borrow/:id")
    .get(requireAuth, ctrlItems.borrow)
    .post(requireAuth, ctrlItems.doBorrow);
router.route("/items/return/:id")
    .get(requireAuth, ctrlItems.returnBack);
router.route("/items/history/:id")
    .get(requireAuth, ctrlItems.history);

/**
 * Catalog
 */
router.route("/catalog")
    .get(ctrlCatalog.index);
router.route("/catalog/borrow/:id")
    .get(ctrlCatalog.borrow)
    .post(ctrlCatalog.doBorrow);

/**
 * Reports
 */
router.route("/reports")
    .get(requireAuth, ctrlReports.index);

module.exports = router;
