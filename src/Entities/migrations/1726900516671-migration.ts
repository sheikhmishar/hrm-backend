import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1726900516671 implements MigrationInterface {
  name = 'Migration1726900516671'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`employee_asset\` (
                \`id\` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` varchar(255) NOT NULL,
                \`givenDate\` date NOT NULL,
                \`returnDate\` date NULL,
                \`employeeId\` int NOT NULL
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            ALTER TABLE \`employee_asset\`
            ADD CONSTRAINT \`asset_owner\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employee\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`employee_asset\` DROP FOREIGN KEY \`asset_owner\`
        `)
  }
}
