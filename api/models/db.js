const mongoose = require("mongoose");

let dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI);

mongoose.connection.on("connected", () =>
    console.log(`Mongoose connected to ${dbURI.replace(/:.+?@/, ":*****@")}.`)
);

mongoose.connection.on("error", (err) =>
    console.log(`Mongoose connection error: ${err}.`)
);

mongoose.connection.on("disconnected", () =>
    console.log("Mongoose disconnected")
);

const gracefulShutdown = async (msg, callback) => {
    await mongoose.connection.close();
    console.log(`Mongoose disconnected through ${msg}.`);
    callback();
};

process.once("SIGUSR2", () => {
    gracefulShutdown("nodemon restart", () =>
        process.kill(process.pid, "SIGUSR2")
    );
});

process.on("SIGINT", () => {
    gracefulShutdown("app termination", () => process.exit(0));
});

process.on("SIGTERM", () => {
    gracefulShutdown("Cloud-based app shutdown", () => process.exit(0));
});

// Let's load all other models
require("./users");
require("./types");
require("./items");
require("./histories");