import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1730185529487 implements MigrationInterface {
  name = 'Migration1730185529487'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`loan\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`amount\` decimal(9, 2) NOT NULL,
          \`date\` date NOT NULL,
          \`employeeId\` int NOT NULL,
          PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
      `)
    await queryRunner.query(`
      ALTER TABLE \`loan\`
      ADD CONSTRAINT \`loan_employee\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employee\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`loan\` DROP FOREIGN KEY \`loan_employee\`
      `)

    await queryRunner.query(`
      DROP TABLE \`loan\`
      `)
  }
}
