CREATE TABLE "variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"external_id" text,
	"label" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"stock_total" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "variants_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_external_id_unique";--> statement-breakpoint
ALTER TABLE "prices" ADD COLUMN "variant_id" integer;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "variants_product_idx" ON "variants" USING btree ("product_id");--> statement-breakpoint
ALTER TABLE "prices" ADD CONSTRAINT "prices_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prices_variant_idx" ON "prices" USING btree ("variant_id");--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "external_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "stock_total";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "active";