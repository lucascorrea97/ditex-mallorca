CREATE TYPE "public"."category" AS ENUM('fabric', 'foam', 'polipiel', 'pvc', 'material', 'accessory');--> statement-breakpoint
CREATE TYPE "public"."price_zone" AS ENUM('all', 'mallorca', 'men_ibz');--> statement-breakpoint
CREATE TYPE "public"."sale_unit" AS ENUM('metro', 'pieza', 'kg', 'metro_lineal', 'unidad', 'm3');--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" text,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" "category",
	"stock_note" text,
	"delivery_terms" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_external_id_unique" UNIQUE("external_id"),
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"zone" "price_zone" DEFAULT 'all' NOT NULL,
	"unit" "sale_unit" NOT NULL,
	"amount" numeric(10, 2),
	"on_request" boolean DEFAULT false NOT NULL,
	"qualifier" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" text,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"category" "category" NOT NULL,
	"collection_id" integer,
	"width" text,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"use_tags" text[] DEFAULT '{}' NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_external_id_unique" UNIQUE("external_id"),
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "prices" ADD CONSTRAINT "prices_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prices_product_idx" ON "prices" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "products_collection_idx" ON "products" USING btree ("collection_id");