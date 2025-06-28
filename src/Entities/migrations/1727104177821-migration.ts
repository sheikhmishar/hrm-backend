import { MigrationInterface, QueryRunner } from 'typeorm'

import { SETTING_KEYS } from '../../utils/misc'

export class Migration1727104177821 implements MigrationInterface {
  name = 'Migration1727104177821'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`setting\` (
        \`property\` varchar(255) NOT NULL,
        \`value\` varchar(255) NOT NULL,
        PRIMARY KEY (\`property\`)
      ) ENGINE = InnoDB
    `)
    // TODO: constant
    await queryRunner.query(`
      INSERT INTO \`setting\` (\`property\`,\`value\`)
      VALUES  ('${SETTING_KEYS.ATTENDANCE_ENTRY_GRACE_PERIOD}', '10m'),
              ('${SETTING_KEYS.ATTENDANCE_LEAVE_GRACE_PERIOD}', '10m'),
              ('${SETTING_KEYS.PAYROLL_CYCLE_START_DATE}', '01')
    `)
    await queryRunner.query(`
      ALTER TABLE \`user\`
      ADD UNIQUE INDEX \`unique_employee_user\` (\`employeeId\`)
    `)
    await queryRunner.query(`
      ALTER TABLE \`user\`
      ADD CONSTRAINT \`employee_user\` FOREIGN KEY (\`employeeId\`) REFERENCES \`employee\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`user\` DROP FOREIGN KEY \`employee_user\`
    `)
    await queryRunner.query(`
      DROP INDEX \`unique_employee_user\` ON \`user\`
    `)
    await queryRunner.query(`DROP TABLE \`setting\``)
  }
}
