/**
 * Load environment variables
 */
require("dotenv").config();

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors');

const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'Sessions'
});

// Catch errors
store.on('error', function (error) {
    console.log(error);
});

/**
 * Swagger and OpenAPI
 */
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = swaggerJsDoc({
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Demo",
            version: "0.1.0",
            description:
                "Demo **REST API** used for [DevOps academy - Web development](https://teaching.lavbic.net/DevOps/WebDev/backend) course at [Faculty of Computer and Information Science](https://www.fri.uni-lj.si/en), [University of Ljubljana](https://www.uni-lj.si/eng) given by [Associate Professor Dejan Lavbič](https://www.lavbic.net)!\n\nThe application supports:\n building your borrow shop.",
        },
        tags: [
            {
                name: "Item",
                description: "Items you want to borrow.",
            },
            {
                name: "Catalog",
                description:
                    "You are searching through catalog to find your desired item.",
            },
            {
                name: "Authentication",
                description: "<b>User management</b> and authentication.",
            },
        ],
        servers: [
            {
                url: "http://localhost:3000/api",
                description: "Development server for testing",
            },
            {
                url: "https://web-dev.fly.dev/api",
                description: "Production server",
            },
        ],
        components: {
            securitySchemes: {
                jwt: {
                    type: "http",
                    scheme: "bearer",
                    in: "header",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                ErrorMessage: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            description: "Message describing the error.",
                        },
                    },
                    required: ["message"],
                },
            },
        },
    },
    apis: ["./api/models/*.js", "./api/controllers/*.js"],
});

/**
 * Database connection
 */
require("./api/models/db.js");

const hbsRouter = require("./hbs/routes/hbs");
const apiRouter = require("./api/routes/api");
const {parseAuthFromCookie, parseAuthFromHeader} = require("./hbs/helpers/auth");

/**
 * Create server
 */
const port = process.env.PORT || 3000;
const app = express();

app.use(cors());

/**
 * Cookie parser
 */
app.use(cookieParser())

/**
 * Static pages
 */
app.use(express.static(path.join(__dirname, "public")));

/**
 * Session handler
 */
app.use(require('express-session')({
    secret: process.env.SESSION_SECRET,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    // Boilerplate options, see:
    // * https://www.npmjs.com/package/express-session#resave
    // * https://www.npmjs.com/package/express-session#saveuninitialized
    resave: true,
    saveUninitialized: true
}));

/**
 * Auth
 */
app.use("/", parseAuthFromCookie);
app.use("/api", parseAuthFromHeader);

/**
 * View engine (HBS) setup
 */
app.set("views", path.join(__dirname, "hbs", "views"));
app.set("view engine", "hbs");

/**
 * HBS routing
 */
app.use("/", bodyParser.urlencoded({extended: false}), hbsRouter);

/**
 * API routing
 */
app.use("/api", bodyParser.json({extended: false}), apiRouter);

/**
 * Swagger file and explorer
 */
apiRouter.get("/swagger.json", (req, res) =>
    res.status(200).json(swaggerDocument)
);
apiRouter.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
        customCss: ".swagger-ui .topbar { display: none }",
    })
);

/**
 * Start server
 */
app.listen(port, () => {
    console.log(
        `Demo app started in ${
            process.env.NODE_ENV || "development"
        } mode listening on port ${port}!`
    );
});
