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
            DROP \`extraBonus\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP \`overtime\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD \`overtime\` int NOT NULL AFTER \`overtimeBonusPerMinute\`
            ADD \`checkedInLateFee\` int NOT NULL AFTER \`overtimeBonusPerMinute\`,
            ADD \`extraBonus\` int NOT NULL AFTER \`overtimeBonusPerMinute\`,
            DROP \`lateDeductionPerMinute\`,
            DROP \`absenseDeductionPerDay\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP COLUMN \`overtimeBonusPerMinute\`
        `);
    }

}
