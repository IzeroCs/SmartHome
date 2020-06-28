import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class EspMigration1593099256691 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'esp',
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },

                {
                    name: 'name',
                    type: 'varchar',
                    length: '30',
                    isNullable: false
                },

                {
                    name: 'online',
                    type: 'boolean',
                    default: false
                },

                {
                    name: 'auth',
                    type: 'boolean',
                    default: false
                }
            ]
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`DROP TABLE esp`);
    }

}
