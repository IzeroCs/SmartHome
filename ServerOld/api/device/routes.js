const promise = require("promise");

const devices = ({ route, db }) => {
    const caller = (() => {
        const path = "/devices";
        const ref  = db.ref(path);

        return {

        };
    })();

    route("device/add",  caller);
    route("device/list", caller);
};

module.exports = devices;
