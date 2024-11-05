import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1730719093745 implements MigrationInterface {
  name = 'Migration1730719093745'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`holiday\` (\`date\` date NOT NULL, PRIMARY KEY (\`date\`)) ENGINE = InnoDB
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`holiday\``)
  }
}
