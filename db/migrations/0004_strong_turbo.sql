CREATE TYPE "public"."request_status" AS ENUM('new', 'handled');--> statement-breakpoint
CREATE TABLE "request_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"product_id" integer,
	"variant_id" integer,
	"product_name" text NOT NULL,
	"variant_label" text,
	"sku" text,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" "sale_unit" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"business_name" text NOT NULL,
	"contact_phone" text,
	"contact_email" text,
	"note" text,
	"status" "request_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "requests_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
ALTER TABLE "request_lines" ADD CONSTRAINT "request_lines_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_lines" ADD CONSTRAINT "request_lines_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_lines" ADD CONSTRAINT "request_lines_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "request_lines_request_idx" ON "request_lines" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "requests_status_idx" ON "requests" USING btree ("status");