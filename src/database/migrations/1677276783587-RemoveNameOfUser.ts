import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveNameOfUser1677276783587 implements MigrationInterface {
  name = 'RemoveNameOfUser1677276783587'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "name" character varying NOT NULL`
    )
  }
}
