import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAvatar1679136043755 implements MigrationInterface {
  name = 'AddAvatar1679136043755'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "avatar" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`)
  }
}
