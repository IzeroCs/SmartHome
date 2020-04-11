define([ "bind", "ajax", "main", "api", "choose" ], function(bind, ajax, main, api, choose) {
    var container = document.querySelector("[data-actionbar]");
    var select    = container.querySelectorAll("li");

    /**
     *
     * @param {boolean} isBind
     */
    function binder(isBind) {
        bindClick(isBind);
    }

    /**
     *
     * @param {boolean} isBind
     */
    function bindClick(isBind) {
        if (select === null || select === undefined)
            return false;

        for (var i = 0; i < select.length; ++i) {
            if (isBind)
                select[i].addEventListener("click", onClick);
            else
                select[i].removeEventListener("click", onClick);
        }

        return true;
    }

    /**
     *
     * @param {Event} event
     */
    function onClick(event) {
        if (this.classList.contains("active")) {
            event.preventDefault();
            return false;
        }

        open(this, this.getAttribute("data-href"));
    }

    /**
     *
     * @param {HTMLElement} element
     * @param {string} href
     */
    function open(element, href) {
        ajax.open({
            url: href,
            method: "GET",
            data: element,

            stateSuccess: function(xhr, res) {
                if (href.endsWith("/list")) {
                    api.get("device/list", {
                        stateSuccess: function(xhr, text, json) {
                            if (!json || !json.devices || !json.data)
                                return;

                            var buff = `<section class="device-list">`;
                            var data = json.data;

                            for (var index in data) {
                                var item    = data[index];
                                var name    = item.name || "Undefined";
                                var type    = item.type || "Undefined";
                                var device  = json.devices[type];

                                if (typeof device !== "undefined") {
                                    buff += `<div class="item">`;
                                    buff += `<table>`;
                                    buff += `<tr class="title device-bg-${device.color}">`;
                                    buff += `<td class="icon"><span class="icomoon icon-device-${device.icon}"></span></td>`;
                                    buff += `<td class="info"><span class="label">${name}</span></td>`;
                                    buff += `</tr>`;
                                    buff += `<tr class="detail">`;
                                    buff += `<td>`;
                                    buff += `Test`;
                                    buff += `</td>`;
                                    buff += `</table>`;
                                    buff += `</div>`;
                                }
                            }

                            buff += `</section>`;

                            removeActive();
                            main.putContent(buff);
                            setActive(element);
                        }
                    });
                } else if (href.endsWith("/add")) {
                    api.get("device/add", {
                        stateSuccess: function(xhr, text, json) {
                            var length = Object.keys(json).length;
                            var device = "";
                            var field  = "";

                            for (var key in json) {
                                var types   = json[key];
                                var traits  = types.traits;

                                device += `<li data-choose="item" data-pager="${key}">`;
                                device += `<span class="icomoon icon-device-${types.icon} device-bg-${types.color}"></span>`;
                                device += `</li>`;

                                field  += `<form data-pager="${key}" data-api="device/add" method="put" onsubmit="return false">`;
                                field  += `<input class="none" type="text" name="device" value="${key}"/>`;
                                field  += `<section class="field-list">`;
                                field  += `<ul class="field">`;
                                field  += `<li class="input">`;
                                field  += `<span class="label">Device name:</span>`;
                                field  += `<input type="text" name="name" value="${types.name}"/>`;
                                field  += `</li>`;
                                field  += `<li class="input">`;
                                field  += `<span class="label">Device nicknames:</span>`;
                                field  += `<input type="text" name="nicknames" value="${types.nicknames.join(", ")}"/>`;
                                field  += `</li>`;
                                field  += `<li class="label">`;
                                field  += `<span>Traits options:</span>`;
                                field  += `</li>`;

                                forEach(traits, function(options, name) {
                                    if (Object.keys(options).length > 0) {
                                        field += `<li class="checkbox collapse">`;
                                        field += `<input type="checkbox" name="traits[]" value="${name.toLowerCase()}"/>`;
                                        field += `<label>${name}</label>`;
                                        field += `<section data-collapse class="collapse">`;

                                        forEach (options, function(opt, key) {
                                            field += `<section class="input">`;
                                            field += `<span class="label">${opt.label}:</span>`;
                                            field += `<input data-type="text" data-array="traits[${name.toLowerCase()}]" type="text" name="${key.toLowerCase()}" value="${opt.value}"/>`;
                                            field += `</section>`;
                                        });

                                        field += `</section>`;
                                        field += `</li>`;
                                    } else {
                                        field  += `<li class="checkbox">`;
                                        field  += `<input type="checkbox" name="traits[]" value="${name.toLowerCase()}"/>`;
                                        field  += `<label>${name}</label>`;
                                        field  += `</li>`;
                                    }
                                });

                                field += `<li class="button">`;
                                field += `<button type="submit" name="submit" data-submit>`;
                                field += `<span data-icon class="icomoon icon-check"></span>`;
                                field += `<span>Create</span>`;
                                field += `</button>`;
                                field += `</ul>`;
                                field += `</section>`;
                                field += `</form>`;
                            }

                            var buff  = `<section data-alert class="alert">`;
                                buff += `<span data-icon></span>`;
                                buff += `<span data-label class="label"></span>`;
                                buff += `</section>`;
                                buff += `<section class="choose">`;
                                buff += `<span class="label">Choose type:</span>`;
                                buff += `<ul data-choose="container">${device}</ul>`;
                                buff += `</section>`;
                                buff += field;

                            removeActive();
                            main.putContent(buff);
                            setActive(element);
                        }
                    });
                }
            }
        })
    }

    function openActive() {
        if (select === null || select === undefined)
            return false;

        for (var i = 0; i < select.length; ++i) {
            var item = select[i];
            var href = item.getAttribute("data-href");

            if (item.classList.contains("active"))
                return open(item, href);
        }

        return false;
    }

    function removeActive() {
        if (select === undefined)
            return false;

        for (var i = 0; i < select.length; ++i)
            select[i].classList.remove("active");

        return true;
    }

    /**
     *
     * @param {HTMLElement} element
     */
    function setActive(element) {
        if (element === null || element === undefined)
            return false;

        element.classList.add("active");
        return true;
    }

    bind.register(binder);
    openActive();
});
