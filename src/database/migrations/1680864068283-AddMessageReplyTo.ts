import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMessageReplyTo1680864068283 implements MigrationInterface {
  name = 'AddMessageReplyTo1680864068283'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" ADD "reply_to_id" uuid`)
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_7bde54db4741c92b434f7fdd292" FOREIGN KEY ("reply_to_id") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_7bde54db4741c92b434f7fdd292"`
    )
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "reply_to_id"`)
  }
}
