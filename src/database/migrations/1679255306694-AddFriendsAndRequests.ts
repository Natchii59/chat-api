import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFriendsAndRequests1679255306694 implements MigrationInterface {
  name = 'AddFriendsAndRequests1679255306694'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_friends" ("sender_id" uuid NOT NULL, "receiver_id" uuid NOT NULL, CONSTRAINT "PK_ea77c07d0c228ff8e63269df36a" PRIMARY KEY ("sender_id", "receiver_id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_d97aa4b9e9bbadb758f37c28c9" ON "user_friends" ("sender_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_432ec0d26472a18559710bd446" ON "user_friends" ("receiver_id") `
    )
    await queryRunner.query(
      `CREATE TABLE "user_requests" ("sender_id" uuid NOT NULL, "receiver_id" uuid NOT NULL, CONSTRAINT "PK_93169c05efb93fb86014030373b" PRIMARY KEY ("sender_id", "receiver_id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_4cac14df3b7de8028ce42e6743" ON "user_requests" ("sender_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_827905c041af71dfc07730924f" ON "user_requests" ("receiver_id") `
    )
    await queryRunner.query(
      `ALTER TABLE "user_friends" ADD CONSTRAINT "FK_d97aa4b9e9bbadb758f37c28c98" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "user_friends" ADD CONSTRAINT "FK_432ec0d26472a18559710bd446b" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "user_requests" ADD CONSTRAINT "FK_4cac14df3b7de8028ce42e67431" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "user_requests" ADD CONSTRAINT "FK_827905c041af71dfc07730924f7" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_requests" DROP CONSTRAINT "FK_827905c041af71dfc07730924f7"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_requests" DROP CONSTRAINT "FK_4cac14df3b7de8028ce42e67431"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_friends" DROP CONSTRAINT "FK_432ec0d26472a18559710bd446b"`
    )
    await queryRunner.query(
      `ALTER TABLE "user_friends" DROP CONSTRAINT "FK_d97aa4b9e9bbadb758f37c28c98"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_827905c041af71dfc07730924f"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4cac14df3b7de8028ce42e6743"`
    )
    await queryRunner.query(`DROP TABLE "user_requests"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_432ec0d26472a18559710bd446"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d97aa4b9e9bbadb758f37c28c9"`
    )
    await queryRunner.query(`DROP TABLE "user_friends"`)
  }
}
