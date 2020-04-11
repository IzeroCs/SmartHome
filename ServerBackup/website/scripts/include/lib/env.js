define([], function() {
    var hostname = "http://" + window.location.hostname;
    var port     = window.location.port;

    /**
     *
     * @param {string} url
     */
    function validateUrl(url) {
        var regex = new RegExp(
            "^(https?:\\/\\/)?" + // protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" +  // domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + //port
            "(\\?[;&amp;a-z\\d%_.~+=-]*)?" + // query string
            "(\\#[-a-z\\d_]*)?$", "i"
        );

        if (regex.test(url))
            return true;
        else
            return false;
    }

    return {
        hostname: hostname,
        port: port,

        getBaseUrl: function(api) {
            if (api)
                return hostname + ":" + port + "/api";

            return hostname + ":" + port;
        },

        makeUrlApi: function(path) {
            if (path.startsWith("http"))
                return path;

            return this.getBaseUrl(true) + "/" + path;
        },

        makeUrl: function(path) {
            if (path.startsWith("http"))
                return path;

            return this.getBaseUrl() + "/" + path;
        }
    };
});
