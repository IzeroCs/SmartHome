define([ ], function() {
    var request  = null;
    var progress = document.querySelector("[data-progress]");
    var https    = {
        200: "OK",
        201: "Created",
        202: "Accepted",
        204: "No Content",
        301: "Moved Permanently",
        302: "Found",
        303: "See Other",
        304: "Not Modified",
        307: "Temporary Redirect",
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        406: "Not Acceptable",
        412: "Precondition Failed",
        415: "Unsupported Media Type",
        422: "Unprocessable Entity",
        500: "Internal Server Error",
        501: "Not Implemented"
    };

    async function wait(ms) {
        return new Promise(function(resolve) {
            setTimeout(resolve, ms);
        });
    }

    function onTransitionEnd() {
        if (parseInt(progress.style.width.replace("vw", "")) < 100)
            return;

        progress.removeEventListener("transitionend", onTransitionEnd);
        progress.style.display = "none";
        progress.style.width   = "0";
    }

    /**
     *
     * @param {Event} event
     */
    function onProgress(event) {
        if (!progress)
            return;

        async function display(percent) {
            if (typeof percent == "undefined") {
                await wait(100);
                progress.style.width = "100vw";
                return;
            }

            if (percent == 0) {
                progress.style.display = "block";
                progress.style.width   = "0";
                progress.addEventListener("transitionend", onTransitionEnd);
                await wait(10);
                progress.style.width = "30vw";

                return;
            }

            if (percent > 100)
                percent = 100;

            progress.style.width = percent + "vw";
        }

        if (event.type == "loadstart")
            display(0);
        else if (event.type == "loadend")
            display(event.target.status == 200 ? 100 : undefined);
        else if (event.type == "progress" && event.lengthComputable)
            display(Math.floor(event.loaded / event.total) * 90);
        else if (event.type == "abort")
            display();
    }

    /**
     *
     * @returns {XMLHttpRequest}
     */
    function create() {
        var xml = null;

        try {
            xml = new XMLHttpRequest();
        } catch (e) {
            try {
                xml = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xml = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                    alert("Your browser broke!");
                    return false;
                }
            }
        }

        if (request != null)
            request.abort();

        return (request = xml);
    }

    /**
     *
     * @param {string} method
     * @param {HTMLElement|object} data
     */
    function collection(method, data) {
        if (typeof data != "object")
            return null;

        var array = {};

        if (data instanceof HTMLButtonElement)
            data = data.form;

        if (data instanceof HTMLFormElement)
            data = data.elements;

        if (data instanceof HTMLFormControlsCollection) {
            var el    = null;
            var match = null;

            for (var i = 0; i < data.length; ++i) {
                el = data[i];

                if (el.type != "hidden") {
                    if (el.type == "checkbox" && !el.checked)
                        continue;

                    if (el.type == "checkbox" && (match = el.name.match(/^(\w+)\[\]$/))) {
                        if (!array[match[1]])
                            array[match[1]] = {};

                        Object.defineProperty(array[match[1]], el.value, {
                            configurable: true,
                            enumerable  : true,
                            writable    : true,
                            value       : {}
                        });
                    } else if (el.hasAttribute("data-array") && (match = el.getAttribute("data-array").match(/^(\w+)\[(\w+)\]$/))) {
                        if (!array[match[1]]) {
                            array[match[1]] = {};

                            Object.defineProperty(array[match[1]], match[2], {
                                configurable: true,
                                enumerable  : true,
                                writable    : true,
                                value       : {}
                            });
                        }

                        Object.defineProperty(array[match[1]][match[2]], el.name, {
                            configurable: true,
                            enumerable  : true,
                            writable    : true,
                            value       : el.value
                        });

                    } else if (el.tagName == "INPUT" || el.tagName == "SELECT") {
                        array[el.name] = el.value;
                    } else if (el.tagName == "BUTTON") {
                        array[el.name] = el.innerText;
                    }
                }
            }
        } else {
            array = data;
        }

        var query = "";

        if (method == "GET" || method == "DELETE") {
            var first = true;

            forEach(array, function(value, name) {
                if (first) {
                    first = false;
                    query += "?";
                } else {
                    query += "&";
                }

                query += encodeURI(name);
                query += "=";
                query += encodeURI(value);
            });
        } else if (method == "POST" || method == "PUT") {
            query = array;
        } else {
            return null;
        }

        return query;
    }

    /**
     *
     * @param {object} options
     */
    function open(options) {
        var url      = "";
        var method   = "GET";
        var dataType = "text";
        var data     = null;

        var stateBegin    = function(xhr) {};
        var stateEnd      = function(xhr) {};
        var stateAbort    = function(xhr) {};
        var stateSuccess  = function(xhr, response) {};
        var stateError    = function(xhr, error) {};
        var stateCallback = function(xhr) {};

        if (typeof options.url != "undefined")
            url = options.url;

        if (typeof options.method != "undefined")
            method = options.method.toUpperCase();

        if (typeof options.dataType != "undefined")
            dataType = options.dataType;

        if (typeof options.data == "object")
            data = options.data;

        if (typeof options.stateBegin == "function")
            stateBegin = options.stateBegin;

        if (typeof options.stateEnd == "function")
            stateEnd = options.stateEnd;

        if (typeof options.stateAbort == "function")
            stateAbort = options.stateAbort;

        if (typeof options.stateSuccess == "function")
            stateSuccess = options.stateSuccess;

        if (typeof options.stateError == "function")
            stateError = options.stateError;

        if (typeof options.stateCallback == "function")
            stateCallback = options.stateCallback;

        if (dataType != "text" && dataType != "json")
            dataType = "text";

        var ajax  = create();
        var query = collection(method, data);

        ajax.onloadstart = function(event) {
            onProgress(event);
            stateBegin(this);
        };

        ajax.onloadend = function(event) {
            onProgress(event);
            stateEnd(this);
        }

        ajax.onabort = function(event) {
            onProgress(event);
        }

        ajax.onreadystatechange = function() {
            var json = null;
            var error = this.statusText;

            if (dataType == "json") {
                try {
                    json = JSON.parse(this.responseText);
                } catch (e) {
                    error = "Parse JSON error";
                }
            }

            if (this.status != 200 && https.hasOwnProperty(this.status)) {
                if (this.status != 422)
                    error = https[this.status];

                if (dataType == "json") {
                    if (json && json.errors)
                        error = json;
                    else
                        error = "Parse JSON error";
                }
            }

            if (this.readyState == 4) {
                if (this.status != 200 || (dataType == "json" && json == null)) {
                    if (this.status <= 0)
                        error = "Error connection timed out";

                    stateError(this, error);
                } else if (this.status == 200) {
                    stateSuccess(this, this.responseText, json);
                } else {
                    stateError(this, error);
                }
            }
        };

        ajax.onprogress = async function(event) {
            onProgress(event);
        };

        ajax.upload.onprogress = function(event) {
            onProgress(event);
        };

        if (query != null && (method == "GET" || method == "DELETE"))
            url += query;

        ajax.open(method, url, true);
        ajax.timeout = 5000;

        if (method == "PUT" || method == "POST")
            ajax.setRequestHeader("Content-type", "application/json; charset=utf-8");

        if (ajax.withCredentials)
            ajax.withCredentials = true;

        if (query != null && (method == "POST" || method == "PUT"))
            ajax.send(JSON.stringify(query));
        else
            ajax.send();

        return ajax;
    }

    return {
        create: create,
        open  : open
    };
});
