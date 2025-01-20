import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1727015941698 implements MigrationInterface {
  name = 'Migration1727015941698'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`employee_attendance\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`arrivalTime\` time NOT NULL,
        \`leaveTime\` time NOT NULL,
        \`date\` date NOT NULL,
        \`late\` int NOT NULL,
        \`overtime\` int NOT NULL,
        \`totalTime\` int NOT NULL,
        \`tasks\` varchar(255) NULL,
        \`employeeId\` int NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
    `)
    await queryRunner.query(`
      CREATE TABLE \`employee_contact\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`phoneNo\` varchar(255) NOT NULL,
        \`relation\` varchar(255) NOT NULL,
        \`employeeId\` int NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
    `)
    await queryRunner.query(`
      CREATE TABLE \`employee_leave\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`from\` date NOT NULL,
        \`to\` date NOT NULL,
        \`totalDays\` decimal(3,1) NOT NULL,
        \`reason\` varchar(255) NOT NULL,
        \`type\` enum ('paid', 'unpaid') NOT NULL DEFAULT 'paid',
        \`status\` enum ('pending', 'approved') NOT NULL DEFAULT 'pending',
        \`duration\` enum ('fullday', 'first_halfday', 'second_halfday') NOT NULL DEFAULT 'fullday',
        \`employeeId\` int NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
    `)
    await queryRunner.query(`
      ALTER TABLE \`employee_attendance\`
      ADD CONSTRAINT \`attendance_employee\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employee\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `)
    await queryRunner.query(`
      ALTER TABLE \`employee_contact\`
      ADD CONSTRAINT \`contact_employee\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employee\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE \`employee_leave\`
      ADD CONSTRAINT \`leave_employee\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employee\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`employee_leave\` DROP FOREIGN KEY \`leave_employee\``
    )

    await queryRunner.query(
      `ALTER TABLE \`employee_contact\` DROP FOREIGN KEY \`contact_employee\``
    )
    await queryRunner.query(
      `ALTER TABLE \`employee_attendance\` DROP FOREIGN KEY \`attendance_employee\``
    )
    await queryRunner.query(`DROP TABLE \`employee_leave\``)
    await queryRunner.query(`DROP TABLE \`employee_contact\``)
    await queryRunner.query(`DROP TABLE \`employee_attendance\``)
  }
}
