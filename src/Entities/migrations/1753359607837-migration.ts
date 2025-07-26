import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1753359607837 implements MigrationInterface {
    name = 'Migration1753359607837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`employee\` ADD \`dayStartTime\` time NOT NULL AFTER \`officeEndTime\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP \`dayStartTime\`
        `);
    }

}
