import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1719916057085 implements MigrationInterface {
    name = 'Migration1719916057085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`duty_type\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active',
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`designation\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active',
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`salary_type\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active',
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`department\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active',
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`company\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`logo\` varchar(255) NULL,
                \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active',
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`branch\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active',
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE \`branch\`
        `);
        await queryRunner.query(`
            DROP TABLE \`company\`
        `);
        await queryRunner.query(`
            DROP TABLE \`department\`
        `);
        await queryRunner.query(`
            DROP TABLE \`salary_type\`
        `);
        await queryRunner.query(`
            DROP TABLE \`designation\`
        `);
        await queryRunner.query(`
            DROP TABLE \`duty_type\`
        `);
    }

}
