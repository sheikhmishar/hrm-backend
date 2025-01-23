import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1727027529425 implements MigrationInterface {
  name = 'Migration1727027529425'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`employee_salary\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`changedAt\` datetime NOT NULL,
        \`basicSalary\` int NOT NULL,
        \`houseRent\` int NOT NULL,
        \`foodCost\` int NOT NULL,
        \`conveyance\` int NOT NULL,
        \`medicalCost\` int NOT NULL,
        \`totalSalary\` decimal(9,2) NOT NULL,
        \`taskWisePayment\` int NULL,
        \`wordLimit\` int NULL,
        \`remarks\` VARCHAR(100) NULL,
        \`designationId\` int NOT NULL,
        \`employeeId\` int NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
    `)
    await queryRunner.query(`
      ALTER TABLE \`employee_salary\`
      ADD CONSTRAINT \`salary_employee\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employee\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `)
    await queryRunner.query(`
        ALTER TABLE \`employee_salary\`
        ADD CONSTRAINT \`salary_employee_designation\` FOREIGN KEY (\`designationId\`) REFERENCES \`designation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`employee_salary\` DROP FOREIGN KEY \`salary_employee_designation\`
    `);
    await queryRunner.query(
      `ALTER TABLE \`employee_salary\` DROP FOREIGN KEY \`salary_employee\``
    )
    await queryRunner.query(`DROP TABLE \`employee_salary\``)
  }
}
