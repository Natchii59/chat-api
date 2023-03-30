import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMessageModified1680037538414 implements MigrationInterface {
  name = 'AddMessageModified1680037538414'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_9c33ecebf23869e65a237a1d151"`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_0959b2e9183870537f6aed6cf44"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_friends" DROP CONSTRAINT "FK_432ec0d26472a18559710bd446b"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_requests" DROP CONSTRAINT "FK_827905c041af71dfc07730924f7"`
    )
    await queryRunner.query(
      `ALTER TABLE "closed_conversations" DROP CONSTRAINT "FK_484c8554fc3d078afad3d31eebf"`
    )
    await queryRunner.query(
      `ALTER TABLE "message" ADD "isModified" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_9c33ecebf23869e65a237a1d151" FOREIGN KEY ("user1_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_0959b2e9183870537f6aed6cf44" FOREIGN KEY ("user2_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_friends" ADD CONSTRAINT "FK_432ec0d26472a18559710bd446b" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_requests" ADD CONSTRAINT "FK_827905c041af71dfc07730924f7" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "closed_conversations" ADD CONSTRAINT "FK_484c8554fc3d078afad3d31eebf" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "closed_conversations" DROP CONSTRAINT "FK_484c8554fc3d078afad3d31eebf"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_requests" DROP CONSTRAINT "FK_827905c041af71dfc07730924f7"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_friends" DROP CONSTRAINT "FK_432ec0d26472a18559710bd446b"`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_0959b2e9183870537f6aed6cf44"`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_9c33ecebf23869e65a237a1d151"`
    )
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "isModified"`)
    await queryRunner.query(
      `ALTER TABLE "closed_conversations" ADD CONSTRAINT "FK_484c8554fc3d078afad3d31eebf" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_requests" ADD CONSTRAINT "FK_827905c041af71dfc07730924f7" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_friends" ADD CONSTRAINT "FK_432ec0d26472a18559710bd446b" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_0959b2e9183870537f6aed6cf44" FOREIGN KEY ("user2_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_9c33ecebf23869e65a237a1d151" FOREIGN KEY ("user1_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}
