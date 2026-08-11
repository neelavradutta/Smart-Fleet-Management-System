ALTER TABLE "drivers" ALTER COLUMN "status" DROP DEFAULT;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."driver_status_new" AS ENUM('ON_DUTY', 'OFF_DUTY', 'ON_LEAVE', 'OFFBOARDED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "drivers"
  ALTER COLUMN "status" TYPE "public"."driver_status_new"
  USING (
    CASE "status"::text
      WHEN 'ACTIVE' THEN 'ON_DUTY'
      WHEN 'INACTIVE' THEN 'OFF_DUTY'
      WHEN 'ON_DUTY' THEN 'ON_DUTY'
      WHEN 'OFF_DUTY' THEN 'OFF_DUTY'
      WHEN 'ON_LEAVE' THEN 'ON_LEAVE'
      WHEN 'OFFBOARDED' THEN 'OFFBOARDED'
      ELSE 'OFF_DUTY'
    END::"public"."driver_status_new"
  );
--> statement-breakpoint
DROP TYPE "public"."driver_status";
--> statement-breakpoint
ALTER TYPE "public"."driver_status_new" RENAME TO "driver_status";
--> statement-breakpoint
ALTER TABLE "drivers" ALTER COLUMN "status" SET DEFAULT 'ON_DUTY';
