define([ "env", "bind", "api" ], function(env, bind, api) {
    var main = document.querySelector("[data-main=\"\"]");

    function init() {
        document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    }

    /**
     *
     * @param {boolean} isBind
     */
    function binder(isBind) {
        var submit = document.querySelectorAll("[data-submit]");

        forEach(submit, function(item) {
            if (isBind)
                item.addEventListener("click", onSubmit);
            else
                item.removeEventListener("click", onSubmit);
        });

        if (isBind)
            checkboxBinder();

        var collapse = document.querySelectorAll("[data-collapse]");

        forEach(collapse, function(element) {
            var label = element.previousElementSibling;
            var input = !label || label.previousElementSibling;

            if (isBind) {
                if (input) {
                    if (input.checked) {
                        setTimeout(function() {
                            onClickCollapse.call(label);
                        }, 10);
                    }

                    collapseInput(element, input.checked);
                }
            } else if (label && label.tagName === "LABEL") {
                label.removeEventListener("click", onClickCollapse);
            }
        });
    }

    function checkboxBinder() {
        var checkboxs = document.querySelectorAll("input[type=checkbox]:not([id])");

        forEach(checkboxs, function(item) {
            var label = item.nextElementSibling;

            if (label && label.tagName === "LABEL" && !label.hasAttribute("for")) {
                var token = api.createToken();

                while (document.getElementById(token) != null)
                    token = api.createToken();

                item.setAttribute("id", token);
                label.setAttribute("for", token);

                var collapse = label.nextElementSibling;

                if (collapse && collapse.hasAttribute("data-collapse"))
                    label.addEventListener("click", onClickCollapse);
            }
        });
    }

    /**
     *
     * @param {boolean|string|Array} message
     * @param {null|string} type
     */
    function alert(message, type) {
        var alert = document.querySelector("[data-alert]");
        var label = !alert || alert.querySelector("[data-label]");

        if (!alert)
            console.info("Not found element alert");

        main.scrollTop = "0px";

        if (message === false) {
            if (alert) {
                alert.style.display = "none";
                label.innerHTML     = "";
            }
        } else if (alert) {
            if (Array.isArray(message)) {
                var inner = "<ol>";

                forEach(message, function(msg) {
                    if (typeof msg === "object" && msg.msg && msg.lists) {
                        inner += `<li><span>${msg.msg}</span></li>`;
                        inner += `<ul>`;

                        forEach(msg.lists, function(item) {
                            inner += `<li><span>${item}</span></li>`;
                        });

                        inner += `</ul>`;
                    } else {
                        inner += `<li><span>${msg}</span></li>`;
                    }
                });

                inner   += `</ol>`;
                message  = inner;
            }

            label.innerHTML     = message;
            alert.style.display = "block";

            alert.classList.remove("danger");
            alert.classList.remove("info");
            alert.classList.remove("waring");
            alert.classList.remove("success");
            alert.classList.add(type || "danger");
        }
    }

    /**
     *
     * @param {HTMLElement} element Form or button element
     * @param {boolean} isShow
     */
    function spinner(element, isShow) {
        if (element.tagName === "FORM")
            element = element.querySelector("[data-submit]");

        if (element && element.tagName === "BUTTON") {
            if (isShow)
                element.classList.add("spinner");
            else
                element.classList.remove("spinner");
        }
    }

    /**
     *
     * @param {Event} event
     */
    function onSubmit(event) {
        var button = this;
        var form   = button.form;
        var action = form.action;
        var method = form.getAttribute("method");

        if (form.hasAttribute("data-api"))
            action = env.makeUrlApi(form.getAttribute("data-api"));
        else if (form.hasAttribute("data-action"))
            action = env.makeUrl(form.getAttribute("data-action"));

        api.any(action, method, {
            data: form,
            stateBegin: function(xhr) {
                alert(false);
                spinner(button, true);
            },

            stateEnd: function(xhr) {
                spinner(button, false);
            },

            stateError: function(xhr, error) {
                if (error && error.errors) {
                    var errs = [];

                    forEach(error.errors, function(e) {
                        errs.push(e.msg);
                    });

                    error = errs;
                }

                alert(error, "danger");
            },

            stateSuccess: function(xhr, text, json) {
                alert(json.message, json.type);
            }
        });
    }

    /**
     *
     * @param {Event} event
     */
    function onClickCollapse(event) {
        var input    = this.previousElementSibling;
        var collapse = this.nextElementSibling;

        if (!input || input.tagName !== "INPUT")
            return;

        setTimeout(function() {
            if (collapse && collapse.hasAttribute("data-collapse")) {
                collapseInput(collapse, input.checked);

                if (input.checked) {
                    collapse.style.height      = "auto";
                    collapse.style.opacity     = "0";
                    collapse.style.position    = "absolute";
                    collapse.style.borderWidth = "1px";

                    var height = collapse.offsetHeight;

                    collapse.style.height   = 0;
                    collapse.style.opacity  = "1";
                    collapse.style.position = "relative";

                    setTimeout(function() {
                        collapse.style.height = height + "px";
                        collapse.setAttribute("data-collapse", "1");
                    }, 50);
                } else {
                    collapse.style.height = "0";
                    collapse.style.opacity = "0";
                    collapse.style.borderWidth = "0";
                    collapse.setAttribute("data-collapse", "0");
                }
            }
        }, 10);
    }

    /**
     *
     * @param {HTMLElement} collapse
     * @param {boolean} isShow
     */
    function collapseInput(collapse, isShow) {
        var ips = collapse.querySelectorAll("input[data-type]");

        forEach(ips, function(it) {
            if (isShow)
                it.type = it.getAttribute("data-type");
            else
                it.type = "hidden";
        });
    }

    /**
     *
     * @param {string} content
     */
    function putContent(content) {
        if (main === null || main === undefined)
            return false;

        bind.calls(false);
        main.innerHTML = content;
        bind.calls();
        main.scrollTop = "0px";

        return true;
    }

    bind.register(binder);
    init();

    return {
        putContent: putContent,
        onSubmit  : onSubmit
    };
});
