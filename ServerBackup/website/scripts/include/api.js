define([ "env", "ajax" ], function(env, ajax) {
    /**
     *
     * @param {string} url
     * @param {string} method
     * @param {null|object|array} options
     * @returns {null}
     */
    function any(url, method, options) {
        if (!options)
            options = {};

        options = Object.assign({
            url: env.makeUrlApi(url),
            method: method,
            dataType: "json",

            stateError: function(xhr, err) {
                console.log(xhr, err);
            },

            stateSuccess: function(xhr, text, json) {
                console.log(json);
            }
        }, options);

        return ajax.open(options);
    }

    /**
     *
     * @param {int} length Min 32
     * @returns {Array}
     */
    function createToken(length) {
        if (!length || length < 32)
            length = 32;

        var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
        var arrs  = [];

        for (var i = 0; i < length; ++i)
            arrs[i] = chars[(Math.random() * (chars.length - 1)).toFixed(0)];

        return arrs.join("");
    }

    return {
        /**
         *
         * @param {string} url
         * @param {string} method
         * @param {null|object|array} options
         */
        any: any,

        /**
         *
         * @param {string} url
         * @param {null|object|array} options
         */
        get: function(url, options) {
            return any(url, "GET", options);
        },

        /**
         *
         * @param {string} url
         * @param {null|object|array} options
         */
        post: function(url, options) {
            return any(url, "POST", options);
        },

        /**
         *
         * @param {string} url
         * @param {null|object|array} options
         */
        put: function(url, options) {
            return any(url, "PUT", options);
        },

        /**
         *
         * @param {string} url
         * @param {null|object|array} options
         */
        delete: function(url, options) {
            return any(url, "DELETE", options);
        },

        createToken: createToken
    };
});
