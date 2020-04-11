define([ "cookie", "io" ], function(cookie, io) {
    var soc = io.connect(window.location.hostname + ":" + window.location.port);
    var sid  = cookie.get("id");
    var ons = {};

    function begin() {
        soc.on("id", function(id) {
            if (sid === undefined)
                sid = id;

            soc.emit("id", sid);
            cookie.set("id", sid);
        });
    }

    function on(event, func = function(socket) {}) {
        if (!ons.hasOwnProperty(event)) {
            Object.defineProperty(ons, event, {
                value: new Array(),
                writable: true
            });
        }

        var events = ons[event];

        for (var i = 0; i < events.length; ++i)
            if (func == events[i])
                return false;

        ons[event].push(func);
        soc.on(event, function() {
            var args = Array.prototype.slice.call(arguments);
            var events = ons[event];

            if (typeof events === "undefined")
                return;

            args.splice(0, 0, soc);

            for (var i = 0; i < events.length; ++i)
                events[i](...args);
        });

        return true;
    }

    function emit() {
        return soc.emit(...arguments);
    }

    soc.on("refresh", function() {
        window.location.reload();
    });

    begin();

    return {
        on: on,
        emit: emit
    };
});
