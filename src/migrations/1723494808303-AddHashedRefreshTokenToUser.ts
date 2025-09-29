import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHashedRefreshTokenToUser1723494808303 implements MigrationInterface {
    name = 'AddHashedRefreshTokenToUser1723494808303'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "hashed_refresh_token" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "hashed_refresh_token"`);
    }

}
