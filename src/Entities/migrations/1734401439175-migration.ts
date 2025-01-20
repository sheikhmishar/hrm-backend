import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1734401439175 implements MigrationInterface {
  name = 'Migration1734401439175'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`employee_document\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`name\` varchar(100) NOT NULL,
          \`path\` varchar(100) NOT NULL,
          \`employeeId\` int NOT NULL,
          PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
  `)

    await queryRunner.query(`
      ALTER TABLE \`employee_document\`
      ADD CONSTRAINT \`document_employee\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employee\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`employee_document\` DROP FOREIGN KEY \`document_employee\`
  `)
    await queryRunner.query(`
      DROP TABLE \`employee_document\`
  `)
  }
}
