import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddImageAndAvatar1679492690010 implements MigrationInterface {
  name = 'AddImageAndAvatar1679492690010'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "avatar" TO "avatar_id"`
    )
    await queryRunner.query(
      `CREATE TABLE "image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "key" character varying NOT NULL, "blurhash" character varying NOT NULL, CONSTRAINT "UQ_7c77ec1a4c00eda85540cbe57ae" UNIQUE ("key"), CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar_id"`)
    await queryRunner.query(`ALTER TABLE "user" ADD "avatar_id" uuid`)
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_b777e56620c3f1ac0308514fc4c" UNIQUE ("avatar_id")`
    )
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_b777e56620c3f1ac0308514fc4c" FOREIGN KEY ("avatar_id") REFERENCES "image"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_b777e56620c3f1ac0308514fc4c"`
    )
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_b777e56620c3f1ac0308514fc4c"`
    )
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar_id"`)
    await queryRunner.query(
      `ALTER TABLE "user" ADD "avatar_id" character varying`
    )
    await queryRunner.query(`DROP TABLE "image"`)
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "avatar_id" TO "avatar"`
    )
  }
}
