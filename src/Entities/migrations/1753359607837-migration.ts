import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1753359607837 implements MigrationInterface {
    name = 'Migration1753359607837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`employee\` ADD \`dayStartTime\` time NOT NULL AFTER \`officeEndTime\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` CHANGE \`officeEndTime\` \`officeEndTime\` VARCHAR(9) NOT NULL;
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee_attendance_session\` CHANGE \`arrivalTime\` \`arrivalTime\` VARCHAR(9) NOT NULL;
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee_attendance_session\` CHANGE \`leaveTime\` \`leaveTime\` VARCHAR(9) NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`employee_attendance_session\` CHANGE \`leaveTime\` \`leaveTime\` time NULL;
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee_attendance_session\` CHANGE \`arrivalTime\` \`arrivalTime\` time NOT NULL;
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` CHANGE \`officeEndTime\` \`officeEndTime\` time NOT NULL;
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP \`dayStartTime\`
        `);
    }

}
