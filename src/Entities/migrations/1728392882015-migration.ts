import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1728392882015 implements MigrationInterface {
  name = 'Migration1728392882015'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`monthly_salary\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`monthStartDate\` date NOT NULL,
        \`paidAt\` datetime NOT NULL,
        \`overtime\` int NOT NULL,
        \`overtimePayment\` decimal(9,2) NOT NULL,
        \`bonus\` decimal(9,2) NOT NULL,
        \`late\` int NOT NULL,
        \`lateDeduction\` decimal(9,2) NOT NULL,
        \`penalty\` decimal(9,2) NOT NULL,
        \`leave\` int NOT NULL,
        \`leaveDeduction\` int NOT NULL,
        \`basicSalary\` int NOT NULL,
        \`houseRent\` int NOT NULL,
        \`foodCost\` int NOT NULL,
        \`conveyance\` int NOT NULL,
        \`medicalCost\` int NOT NULL,
        \`totalSalary\` decimal(9,2) NOT NULL,
        \`paymentMethod\` varchar(255) NOT NULL,
        \`status\` enum ('Paid', 'Unpaid') NOT NULL DEFAULT 'Unpaid',
        \`employeeId\` int NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
    `)
    await queryRunner.query(`
      ALTER TABLE \`monthly_salary\`
      ADD CONSTRAINT \`monthly_salary_employee\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employee\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `)
    await queryRunner.query(`
      ALTER TABLE \`monthly_salary\`
      ADD UNIQUE INDEX \`unique_monthly_salary_employee\` (\`employeeId\`, \`monthStartDate\`)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX \`unique_monthly_salary_employee\` ON \`monthly_salary\`
    `)
    await queryRunner.query(`
      ALTER TABLE \`monthly_salary\` DROP FOREIGN KEY \`monthly_salary_employee\`
    `)
    await queryRunner.query(`
      DROP TABLE \`monthly_salary\`
    `)
  }
}
