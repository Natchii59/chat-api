import { MigrationInterface, QueryRunner } from 'typeorm'

export class MessageExtendNode1677098081988 implements MigrationInterface {
  name = 'MessageExtendNode1677098081988'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "message" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "updated_at"`)
  }
}
