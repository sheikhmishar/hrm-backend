import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1719896926800 implements MigrationInterface {
    name = 'Migration1719896926800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`phoneNumber\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`type\` enum ('superAdmin', 'admin') NOT NULL DEFAULT 'admin',
                UNIQUE INDEX \`user_email\` (\`email\`),
                UNIQUE INDEX \`user_phone_number\` (\`phoneNumber\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`user_phone_number\` ON \`user\`
        `);
        await queryRunner.query(`
            DROP INDEX \`user_email\` ON \`user\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user\`
        `);
    }

}
