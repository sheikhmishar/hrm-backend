import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1720349148338 implements MigrationInterface {
    name = 'Migration1720349148338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`employee\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`eId\` varchar(255) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`phoneNumber\` varchar(255) NOT NULL,
                \`altPhoneNumber\` varchar(255) NULL,
                \`email\` varchar(255) NOT NULL,
                \`dateOfBirth\` date NOT NULL,
                \`fullAddress\` varchar(255) NOT NULL,
                \`gender\` enum ('Male', 'Female', 'Others') NOT NULL,
                \`photo\` varchar(255) NULL,
                \`dateOfJoining\` date NOT NULL,
                \`unitSalary\` int NOT NULL,
                \`taskWisePayment\` int NULL,
                \`wordLimit\` int NULL,
                \`officeStartTime\` time NOT NULL,
                \`officeEndTime\` time NOT NULL,
                \`checkedInLateFee\` enum ('applicable', 'inApplicable') NOT NULL,
                \`overtime\` enum ('applicable', 'inApplicable') NOT NULL,
                \`noticePeriod\` date NULL,
                \`extraBonus\` enum ('applicable', 'inApplicable') NOT NULL,
                \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active',
                \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`companyId\` int NOT NULL,
                \`departmentId\` int NOT NULL,
                \`branchId\` int NOT NULL,
                \`designationId\` int NOT NULL,
                \`dutyTypeId\` int NOT NULL,
                \`salaryTypeId\` int NOT NULL,
                UNIQUE INDEX \`employee_unique_eid\` (\`eId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        // TODO: foreign key constraint names should be better
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD CONSTRAINT \`employee_company\` FOREIGN KEY (\`companyId\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD CONSTRAINT \`employee_department\` FOREIGN KEY (\`departmentId\`) REFERENCES \`department\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD CONSTRAINT \`employee_branch\` FOREIGN KEY (\`branchId\`) REFERENCES \`branch\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD CONSTRAINT \`employee_designation\` FOREIGN KEY (\`designationId\`) REFERENCES \`designation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD CONSTRAINT \`employee_duty_type\` FOREIGN KEY (\`dutyTypeId\`) REFERENCES \`duty_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD CONSTRAINT \`employee_salary_type\` FOREIGN KEY (\`salaryTypeId\`) REFERENCES \`salary_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP FOREIGN KEY \`employee_salary_type\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP FOREIGN KEY \`employee_duty_type\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP FOREIGN KEY \`employee_designation\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP FOREIGN KEY \`employee_branch\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP FOREIGN KEY \`employee_department\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP FOREIGN KEY \`employee_company\`
        `);
        await queryRunner.query(`
            DROP INDEX \`employee_unique_eid\` ON \`employee\`
        `);
        await queryRunner.query(`
            DROP TABLE \`employee\`
        `);
    }

}
