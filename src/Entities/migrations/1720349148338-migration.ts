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
                \`taskWisePayment\` int NOT NULL,
                \`wordLimit\` int NOT NULL,
                \`officeStartTime\` time NOT NULL,
                \`officeEndTime\` time NOT NULL,
                \`checkedInLateFee\` enum ('applicable', 'inApplicable') NOT NULL,
                \`overtime\` enum ('applicable', 'inApplicable') NOT NULL,
                \`noticePeriod\` date NOT NULL,
                \`extraBonus\` enum ('applicable', 'inApplicable') NOT NULL,
                \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active',
                \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`companyId\` int NOT NULL,
                \`departmentId\` int NOT NULL,
                \`branchId\` int NOT NULL,
                \`designationId\` int NOT NULL,
                \`dutyTypeId\` int NOT NULL,
                \`salaryTypeId\` int NOT NULL,
                UNIQUE INDEX \`IDX_b5817fccb63ba0b5551eeaa854\` (\`eId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        // TODO: foreign key constraint names should be better
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD CONSTRAINT \`FK_26c3d513e0832e5abbbdd3d2a88\` FOREIGN KEY (\`companyId\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD CONSTRAINT \`FK_9ad20e4029f9458b6eed0b0c454\` FOREIGN KEY (\`departmentId\`) REFERENCES \`department\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD CONSTRAINT \`FK_c36b6dc182259c56ee8c1cfecb3\` FOREIGN KEY (\`branchId\`) REFERENCES \`branch\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD CONSTRAINT \`FK_e41e10c17872cdf2f511e5d0097\` FOREIGN KEY (\`designationId\`) REFERENCES \`designation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD CONSTRAINT \`FK_6f62fae90c6103d84dc6ddf6141\` FOREIGN KEY (\`dutyTypeId\`) REFERENCES \`duty_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\`
            ADD CONSTRAINT \`FK_1d63c8a9288d42747b5c5e20f7e\` FOREIGN KEY (\`salaryTypeId\`) REFERENCES \`salary_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP FOREIGN KEY \`FK_1d63c8a9288d42747b5c5e20f7e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP FOREIGN KEY \`FK_6f62fae90c6103d84dc6ddf6141\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP FOREIGN KEY \`FK_e41e10c17872cdf2f511e5d0097\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP FOREIGN KEY \`FK_c36b6dc182259c56ee8c1cfecb3\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP FOREIGN KEY \`FK_9ad20e4029f9458b6eed0b0c454\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`employee\` DROP FOREIGN KEY \`FK_26c3d513e0832e5abbbdd3d2a88\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_b5817fccb63ba0b5551eeaa854\` ON \`employee\`
        `);
        await queryRunner.query(`
            DROP TABLE \`employee\`
        `);
    }

}
