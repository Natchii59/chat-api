import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserUnreadMessagesRelation1680769895002
  implements MigrationInterface
{
  name = 'AddUserUnreadMessagesRelation1680769895002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_unread_messages" ("message_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_69aef0c265db8671fce81e9805b" PRIMARY KEY ("message_id", "user_id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_b01ec785adf0f4c6acf94ca10c" ON "user_unread_messages" ("message_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_1b942b11516588a7a349f127ce" ON "user_unread_messages" ("user_id") `
    )
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "isRead"`)
    await queryRunner.query(
      `ALTER TABLE "user_unread_messages" ADD CONSTRAINT "FK_b01ec785adf0f4c6acf94ca10c1" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "user_unread_messages" ADD CONSTRAINT "FK_1b942b11516588a7a349f127ceb" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_unread_messages" DROP CONSTRAINT "FK_1b942b11516588a7a349f127ceb"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_unread_messages" DROP CONSTRAINT "FK_b01ec785adf0f4c6acf94ca10c1"`
    )
    await queryRunner.query(
      `ALTER TABLE "message" ADD "isRead" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1b942b11516588a7a349f127ce"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b01ec785adf0f4c6acf94ca10c"`
    )
    await queryRunner.query(`DROP TABLE "user_unread_messages"`)
  }
}
