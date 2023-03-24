import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddClosedByInConversation1679689765739
  implements MigrationInterface
{
  name = 'AddClosedByInConversation1679689765739'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "closed_conversations" ("conversation_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_a5fc3597bf26548d3e91f5b2b31" PRIMARY KEY ("conversation_id", "user_id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_e46362da8f924f78e9842e4867" ON "closed_conversations" ("conversation_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_484c8554fc3d078afad3d31eeb" ON "closed_conversations" ("user_id") `
    )
    await queryRunner.query(
      `ALTER TABLE "closed_conversations" ADD CONSTRAINT "FK_e46362da8f924f78e9842e4867c" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "closed_conversations" ADD CONSTRAINT "FK_484c8554fc3d078afad3d31eebf" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "closed_conversations" DROP CONSTRAINT "FK_484c8554fc3d078afad3d31eebf"`
    )
    await queryRunner.query(
      `ALTER TABLE "closed_conversations" DROP CONSTRAINT "FK_e46362da8f924f78e9842e4867c"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_484c8554fc3d078afad3d31eeb"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e46362da8f924f78e9842e4867"`
    )
    await queryRunner.query(`DROP TABLE "closed_conversations"`)
  }
}
