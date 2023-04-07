import { MigrationInterface, QueryRunner } from 'typeorm'

export class RefactorEntities1680625155498 implements MigrationInterface {
  name = 'RefactorEntities1680625155498'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_0959b2e9183870537f6aed6cf44"`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_9c33ecebf23869e65a237a1d151"`
    )
    await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "user2_id"`)
    await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "user1_id"`)
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD "last_message_sent_at" TIMESTAMP`
    )
    await queryRunner.query(`ALTER TABLE "conversation" ADD "creator_id" uuid`)
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD "recipient_id" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_bf7659f325301df54aa401d93fc" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_5f200a4581a60ead14ed9d8cb53" FOREIGN KEY ("recipient_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_5f200a4581a60ead14ed9d8cb53"`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_bf7659f325301df54aa401d93fc"`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP COLUMN "recipient_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP COLUMN "creator_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP COLUMN "last_message_sent_at"`
    )
    await queryRunner.query(`ALTER TABLE "conversation" ADD "user1_id" uuid`)
    await queryRunner.query(`ALTER TABLE "conversation" ADD "user2_id" uuid`)
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_9c33ecebf23869e65a237a1d151" FOREIGN KEY ("user1_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_0959b2e9183870537f6aed6cf44" FOREIGN KEY ("user2_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }
}
