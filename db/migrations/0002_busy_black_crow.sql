ALTER TYPE "public"."sale_unit" ADD VALUE 'plancha';--> statement-breakpoint
ALTER TYPE "public"."sale_unit" ADD VALUE 'caja';--> statement-breakpoint
ALTER TYPE "public"."sale_unit" ADD VALUE 'embalaje';--> statement-breakpoint
ALTER TYPE "public"."sale_unit" ADD VALUE 'pvp';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "familia" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "stock_total" numeric(10, 2);--> statement-breakpoint
CREATE INDEX "products_familia_idx" ON "products" USING btree ("familia");