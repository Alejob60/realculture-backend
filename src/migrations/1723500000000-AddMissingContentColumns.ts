import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingContentColumns1723500000000 implements MigrationInterface {
    name = 'AddMissingContentColumns1723500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add updated_at column if it doesn't exist
        await queryRunner.query(`
            ALTER TABLE "contents" 
            ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITHOUT TIME ZONE
        `);
        
        // Add other potentially missing columns
        await queryRunner.query(`
            ALTER TABLE "contents" 
            ADD COLUMN IF NOT EXISTS "audio_url" TEXT
        `);
        
        await queryRunner.query(`
            ALTER TABLE "contents" 
            ADD COLUMN IF NOT EXISTS "audio_duration" FLOAT
        `);
        
        await queryRunner.query(`
            ALTER TABLE "contents" 
            ADD COLUMN IF NOT EXISTS "audio_voice" TEXT
        `);
        
        await queryRunner.query(`
            ALTER TABLE "contents" 
            ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP
        `);
        
        await queryRunner.query(`
            ALTER TABLE "contents" 
            ADD COLUMN IF NOT EXISTS "filename" TEXT
        `);
        
        await queryRunner.query(`
            ALTER TABLE "contents" 
            ADD COLUMN IF NOT EXISTS "title" TEXT
        `);
        
        await queryRunner.query(`
            ALTER TABLE "contents" 
            ADD COLUMN IF NOT EXISTS "description" TEXT
        `);
        
        await queryRunner.query(`
            ALTER TABLE "contents" 
            ADD COLUMN IF NOT EXISTS "metadata" JSONB
        `);
        
        // Create indexes for better performance
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_contents_creator_user_id" 
            ON "contents"("creatorUserId")
        `);
        
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_contents_created_at" 
            ON "contents"(created_at)
        `);
        
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_contents_type" 
            ON "contents"(type)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_contents_type"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_contents_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_contents_creator_user_id"`);
        
        // Drop columns (in reverse order)
        await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN IF EXISTS "metadata"`);
        await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN IF EXISTS "description"`);
        await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN IF EXISTS "title"`);
        await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN IF EXISTS "filename"`);
        await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN IF EXISTS "expires_at"`);
        await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN IF EXISTS "audio_voice"`);
        await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN IF EXISTS "audio_duration"`);
        await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN IF EXISTS "audio_url"`);
        await queryRunner.query(`ALTER TABLE "contents" DROP COLUMN IF EXISTS "updated_at"`);
    }

}