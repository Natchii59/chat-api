import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMessageRead1680551079867 implements MigrationInterface {
  name = 'AddMessageRead1680551079867'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "message" ADD "isRead" boolean NOT NULL DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "isRead"`)
  }
}
