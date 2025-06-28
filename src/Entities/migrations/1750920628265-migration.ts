import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1750920628265 implements MigrationInterface {
    name = 'Migration1750920628265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD \`absenseDeductionPerDay\` int NOT NULL AFTER \`overtime\`,
            ADD \`lateDeductionPerMinute\` int NOT NULL AFTER \`overtime\`,
            ADD \`overtimeBonusPerMinute\` int NOT NULL AFTER \`overtime\`,
            DROP COLUMN \`checkedInLateFee\`,
            DROP \`overtime\`,
            DROP \`extraBonus\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            DROP COLUMN \`overtimeBonusPerMinute\`,
            DROP COLUMN \`lateDeductionPerMinute\`,
            DROP COLUMN \`absenseDeductionPerDay\`,
            ADD \`checkedInLateFee\` int NOT NULL AFTER \`overtime\`,
            ADD \`overtime\` int NOT NULL AFTER \`overtime\`,
            ADD \`extraBonus\` int NOT NULL AFTER \`overtime\`
        `);
    }

}
