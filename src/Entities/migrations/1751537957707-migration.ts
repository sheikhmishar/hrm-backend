import { MigrationInterface, QueryRunner } from 'typeorm'

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
    `)
    await queryRunner.query(`
      ALTER TABLE \`employee_attendance_session\`
      ADD CONSTRAINT \`session_attendance\` FOREIGN KEY (\`attendanceId\`) REFERENCES \`employee_attendance\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`employee_attendance_session\` DROP FOREIGN KEY \`session_attendance\`
    `);
    await queryRunner.query(`
      DROP TABLE \`employee_attendance_session\`
    `)
  }
}
