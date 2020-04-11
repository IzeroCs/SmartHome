const {check, validationResult} = require("express-validator");

const routes = async (app, db) => {
    app.use((req, res, next) => {
        setTimeout(next, Math.abs(Math.random() * 1000));
    });

    function route(uri, file, opts) {
        if (typeof file === "object" || typeof file === "function") {
            opts = file;
            file = undefined;
        }

        if (!file)
            file = "./" + uri;

        return require(file)({
            route    : app.route("/api/" + uri),
            db       : db,
            check    : check,
            validator: validationResult,
            options  : opts
        });
    }

    require("./device/routes")({
        app      : app,
        db       : db,
        route    : route,
        check    : check,
        validator: validationResult
    });
};

module.exports = routes;
