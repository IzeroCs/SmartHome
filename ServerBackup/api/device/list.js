const promise = require("promise");
const func    = require("../function");

module.exports = (route, db, check, validator, devices) => {
    route.get(async (req, res) => {
        res.send({
            devices: require("../../devices.json"),
            data: await devices.list()
        });
    });
};
