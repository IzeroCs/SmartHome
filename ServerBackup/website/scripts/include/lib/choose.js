define([ "bind" ], function(bind) {
    function binder(isBind) {
        if (isBind) {
            var parents = document.querySelectorAll(`[data-choose="container"]`);

            if (parents !== null) for (var i = 0; i < parents.length; ++i) {
                var parent      = parents[i];
                var children    = parent.children;
                var firstChild  = null;
                var hasSelected = false;

                if (children !== null) for (var j = 0; j < children.length; ++j) {
                    var child = children[j];
                    var attr  = child.getAttribute("data-choose");

                    if (attr == "input") {
                        var inputs = child.children;

                        if (inputs.length === 1 && inputs[0].tagName === "INPUT")
                            parent.input = inputs[0];
                    } else if (attr == "item") {
                        if (firstChild == null)
                            firstChild = child;

                        if (child.classList.contains("selected")) {
                            hasSelected  = true;
                            parent.select = child;
                        }
                    }
                }

                if (!hasSelected && firstChild != null) {
                    parent.select = firstChild;
                    firstChild.classList.add("selected");
                    pagerDisplay(firstChild);
                }
            }
        }

        var items = document.querySelectorAll(`[data-choose="item"]`);
        var pagers = document.querySelectorAll(`[data-pager]:not([data-choose])`);

        forEach(items, function(item) {
            if (isBind)
                item.addEventListener("click", onClick);
            else
                item.removeEventListener("click", onClick);
        });

        if (!isBind) forEach(pagers, function(pager) {
            if (pager.parentNode)
                pager.parentNode.removeChild(pager);
        });
    }

    function onClick(event) {
        var parent = this.parentNode;

        if (this.getAttribute("data-choose") != "item" || parent === undefined) {
            event.stopPropagation();
            event.preventDefault();

            return false;
        }

        var childrens = parent.children;
        var child     = null;

        for (var i = 0; i < childrens.length; ++i) {
            child = childrens[i];

            if (child.getAttribute("data-choose") == "item")
                child.classList.remove("selected");
        }

        this.classList.add("selected");
        parent.select = this;
        pagerDisplay(this);

        if (parent.input !== undefined)
            parent.input.value = this.getAttribute("data-value");

        event.stopPropagation();
        event.preventDefault();

        return false;
    }

    function pagerDisplay(element) {
        var attr = element.getAttribute("data-pager");
        var pagers = document.querySelectorAll("[data-pager]");

        if (pagers != null) for (var i = 0; i < pagers.length; ++i) {
            var pager     = pagers[i];
            var pagerAttr = pager.getAttribute("data-pager");

            if (!pager.hasAttribute("data-choose")) {
                if (attr == pagerAttr)
                    pager.style.display = "block";
                else
                    pager.style.display = "none";
            }
        }
    }

    bind.register(binder);

    return {

    };
});
