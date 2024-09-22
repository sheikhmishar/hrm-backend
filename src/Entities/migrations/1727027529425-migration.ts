import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1727027529425 implements MigrationInterface {
  name = 'Migration1727027529425'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`employee_salary\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`month\` date NOT NULL,
        \`paidAt\` date NOT NULL,
        \`overtime\` int NOT NULL DEFAULT '0',
        \`overtimePayment\` decimal NOT NULL DEFAULT '0',
        \`lateMinutes\` int NOT NULL DEFAULT '0',
        \`latePenalty\` decimal NOT NULL DEFAULT '0',
        \`bonus\` decimal NOT NULL DEFAULT '0',
        \`totalSalary\` decimal NOT NULL DEFAULT '0',
        \`paymentMethod\` varchar(255) NOT NULL,
        \`status\` enum ('paid', 'unpaid') NOT NULL DEFAULT 'paid',
        \`employeeId\` int NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
    `)
    await queryRunner.query(`
      ALTER TABLE \`employee_salary\`
      ADD CONSTRAINT \`salary_employee\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employee\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`employee_salary\` DROP FOREIGN KEY \`salary_employee\``
    )
    await queryRunner.query(`DROP TABLE \`employee_salary\``)
  }
}
