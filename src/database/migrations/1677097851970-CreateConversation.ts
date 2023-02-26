import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateConversation1677097851970 implements MigrationInterface {
  name = 'CreateConversation1677097851970'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "conversation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user1_id" uuid, "user2_id" uuid, CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`ALTER TABLE "message" ADD "conversation_id" uuid`)
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_9c33ecebf23869e65a237a1d151" FOREIGN KEY ("user1_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_0959b2e9183870537f6aed6cf44" FOREIGN KEY ("user2_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_7fe3e887d78498d9c9813375ce2" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_7fe3e887d78498d9c9813375ce2"`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_0959b2e9183870537f6aed6cf44"`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_9c33ecebf23869e65a237a1d151"`
    )
    await queryRunner.query(
      `ALTER TABLE "message" DROP COLUMN "conversation_id"`
    )
    await queryRunner.query(`DROP TABLE "conversation"`)
  }
}
