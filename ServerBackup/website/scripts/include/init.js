define([ "bind" ], function(bind) {
    return { init: function() {
        bind.calls(false);
        bind.calls();
    }};
});
