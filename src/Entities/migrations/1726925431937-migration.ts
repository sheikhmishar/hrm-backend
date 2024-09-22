import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726925431937 implements MigrationInterface {
    name = 'Migration1726925431937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`employee_financial\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`holderName\` varchar(255) NOT NULL,
                \`medium\` varchar(255) NOT NULL,
                \`accountNumber\` varchar(255) NOT NULL,
                \`bankName\` varchar(255) NOT NULL,
                \`branch\` varchar(255) NOT NULL,
                \`employeeId\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee_financial\`
            ADD CONSTRAINT \`financial_holder\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employee\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`employee_financial\` DROP FOREIGN KEY \`financial_holder\`
        `);
        await queryRunner.query(`
            DROP TABLE \`employee_financial\`
        `);
    }

}
