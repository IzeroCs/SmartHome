define([], function() {
    var regs = [];

    function register(func = function(isBind) {}) {
        for (var i = 0; i < regs.length; ++i)
            if (func == regs[i])
                return false;

        regs.push(func);
        return true;
    }

    function unregister(func) {
        for (var i = 0; i < regs.length; ++i) {
            if (func == regs[i]) {
                regs.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    function calls(isBind = true) {
        for (var i = 0; i < regs.length; ++i)
            regs[i](isBind);
    }

    return {
        register  : register,
        unregister: unregister,
        calls     : calls
    };
});
