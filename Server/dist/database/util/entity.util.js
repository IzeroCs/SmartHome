"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityUtil = void 0;
var typeorm_1 = require("typeorm");
var util_1 = require("util");
var EntityUtil = /** @class */ (function () {
    function EntityUtil() {
    }
    EntityUtil.getEntityManager = function () {
        if (util_1.isUndefined(EntityUtil.entityManager))
            EntityUtil.entityManager = typeorm_1.getConnection().createEntityManager();
        return EntityUtil.entityManager;
    };
    EntityUtil.create = function (entityClass, plainObject) {
        return this.getEntityManager().create(entityClass, plainObject);
    };
    return EntityUtil;
}());
exports.EntityUtil = EntityUtil;
//# sourceMappingURL=entity.util.js.map