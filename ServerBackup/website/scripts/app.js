function forEach(obj, fn) {
    if (obj === null || typeof obj === 'undefined')
        return;

    if (typeof obj !== 'object')
        obj = [obj];

    if (toString.call(obj) === '[object Array]') {
        for (let i = 0, l = obj.length; i < l; i++)
            fn.call(null, obj[i], i, obj);
    } else {
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
                fn.call(null, obj[key], key, obj);
        }
    }
}


requirejs.config({
    baseUrl: "/scripts/include",
    paths: {
        env      : "lib/env",
        cookie   : "cookie",
        io       : "io",
        bind     : "bind",
        ajax     : "ajax",
        main     : "main",
        api      : "api",
        socket   : "socket",
        actionbar: "actionbar",
        init     : "init",
        choose   : "lib/choose"
    },
    shim: {
        bootstrap: {
            deps: [
                "env",
                "cookie",
                "io",
                "bind",
                "ajax",
                "main",
                "api",
                "socket",
                "choose",
                "actionbar",
                "init"
            ]
        }
    }
});

require([
    "env",
    "socket",
    "actionbar",
    "init"
], function(env, socket, actionbar, init) { init.init(); });
