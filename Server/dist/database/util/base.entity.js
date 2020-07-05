"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
var typeorm_1 = require("typeorm");
var BaseEntity = /** @class */ (function () {
    function BaseEntity() {
        if (!BaseEntity.entityManager)
            BaseEntity.entityManager = typeorm_1.getConnection().createEntityManager();
    }
    BaseEntity.create = function (entityClass, plainObject) {
        return BaseEntity.entityManager.create(entityClass, plainObject);
    };
    return BaseEntity;
}());
exports.BaseEntity = BaseEntity;
//# sourceMappingURL=base.entity.js.map