"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityUtil = void 0;
const typeorm_1 = require("typeorm");
const util_1 = require("util");
class EntityUtil {
    static getEntityManager() {
        if (util_1.isUndefined(EntityUtil.entityManager))
            EntityUtil.entityManager = typeorm_1.getConnection().createEntityManager();
        return EntityUtil.entityManager;
    }
    static create(entityClass, plainObject) {
        return this.getEntityManager().create(entityClass, plainObject);
    }
}
exports.EntityUtil = EntityUtil;
//# sourceMappingURL=entity.util.js.map