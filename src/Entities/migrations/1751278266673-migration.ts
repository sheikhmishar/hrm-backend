import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1751278266673 implements MigrationInterface {
    name = 'Migration1751278266673'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`deduction_type\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active',
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`bonus_type\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active',
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE \`bonus_type\`
        `);
        await queryRunner.query(`
            DROP TABLE \`deduction_type\`
        `);
    }

}
