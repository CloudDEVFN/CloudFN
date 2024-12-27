const express = require("express");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Routes
app.use(require("./structure/party.js"));
app.use(require("./structure/discovery.js"));
app.use(require("./structure/privacy.js"));
app.use(require("./structure/timeline.js"));
app.use(require("./structure/user.js"));
app.use(require("./structure/contentpages.js"));
app.use(require("./structure/friends.js"));
app.use(require("./structure/main.js"));
app.use(require("./structure/storefront.js"));
app.use(require("./structure/version.js"));
app.use(require("./structure/lightswitch.js"));
app.use(require("./structure/affiliate.js"));
app.use(require("./structure/matchmaking.js"));
app.use(require("./structure/cloudstorage.js"));
app.use(require("./structure/mcp.js"));
app.use(require("./Config/catalog_config.json"));

// Start Server
const port = process.env.PORT || 3551;
app.listen(port, () => {
    console.log(`CloudFN started listening on port ${port}`);
    require("./structure/xmpp.js");
}).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.log(`\x1b[31mERROR\x1b[0m: Port ${port} is already in use!`);
    } else {
        throw err;
    }
    process.exit(0);
});

// Ensure directories exist
const appDataPath = path.join(process.env.LOCALAPPDATA, "CloudFN-main");
const fallbackPath = path.join(__dirname, "ClientSettings");

try {
    if (!fs.existsSync(appDataPath)) {
        fs.mkdirSync(appDataPath);
    }
} catch (err) {
    // Fallback if LOCALAPPDATA path creation fails
    if (!fs.existsSync(fallbackPath)) {
        fs.mkdirSync(fallbackPath);
    }
}

// Handle 404 Errors
app.use((req, res) => {
    const errorName = "errors.com.cloudfn.common.not_found";
    const errorCode = 1004;

    res.set({
        'X-Epic-Error-Name': errorName,
        'X-Epic-Error-Code': errorCode
    });

    res.status(404).json({
        errorCode: errorName,
        errorMessage: "Sorry, the resource you were trying to find could not be found",
        numericErrorCode: errorCode,
        originatingService: "any",
        intent: "prod"
    });
});
