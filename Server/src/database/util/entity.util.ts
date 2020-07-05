import { EntityManager, getConnection, ObjectType, DeepPartial } from "typeorm"
import { RoomDevice } from "../entity/room_device.entity"
import { isUndefined } from "util"

export abstract class EntityUtil {
    private static entityManager: EntityManager

    static getEntityManager(): EntityManager {
        if (isUndefined(EntityUtil.entityManager))
            EntityUtil.entityManager = getConnection().createEntityManager()

        return EntityUtil.entityManager
    }

    static create<Entity>(
        entityClass: ObjectType<Entity>,
        plainObject?: DeepPartial<Entity>,
    ): Entity {
        return this.getEntityManager().create(entityClass, plainObject)
    }
}
