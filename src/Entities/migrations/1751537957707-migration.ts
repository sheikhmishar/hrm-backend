import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1751537957707 implements MigrationInterface {
    name = 'Migration1751537957707'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`employee_attendance_session\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`arrivalTime\` time NOT NULL,
                \`leaveTime\` time NULL,
                \`sessionTime\` int NOT NULL,
                \`attendanceId\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE \`employee_attendance_session\`
        `);
    }

}
