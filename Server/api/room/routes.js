const promise = require("promise");

const rooms = ({ route, db }) => {
    const caller = (() => {
        const path = "/room";
        const ref  = db.ref(path);

        return {

        };
    })();

    route("room/type",  caller);
};

module.exports = rooms;
