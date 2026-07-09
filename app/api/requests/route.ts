import { sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { db, schema } from "@/db";

// Reorder/enquiry Request flow (#21, ADR-0020): a signed-in Client submits a structured,
// non-binding ask built from the Catalogue. Client Area is a shared password (no per-Client
// session), so business name + at least one contact method are required on the request
// itself. No price is ever computed or promised here — the office confirms by phone/email.
export const dynamic = "force-dynamic";

type LineInput = {
  productId?: unknown;
  variantId?: unknown;
  productName?: unknown;
  variantLabel?: unknown;
  sku?: unknown;
  quantity?: unknown;
  unit?: unknown;
  note?: unknown;
};

type RequestBody = {
  businessName?: unknown;
  contactPhone?: unknown;
  contactEmail?: unknown;
  note?: unknown;
  lines?: unknown;
};

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function optionalId(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

const VALID_UNITS = new Set<string>(schema.saleUnitEnum.enumValues);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido." }, { status: 400 });
  }

  const businessName = optionalString(body.businessName);
  const contactPhone = optionalString(body.contactPhone);
  const contactEmail = optionalString(body.contactEmail);
  const generalNote = optionalString(body.note);
  const rawLines = Array.isArray(body.lines) ? (body.lines as LineInput[]) : [];

  if (!businessName) {
    return NextResponse.json({ error: "Falta el nombre del negocio." }, { status: 400 });
  }
  if (!contactPhone && !contactEmail) {
    return NextResponse.json(
      { error: "Indica al menos un teléfono o un correo electrónico." },
      { status: 400 },
    );
  }
  if (rawLines.length === 0) {
    return NextResponse.json({ error: "La solicitud no tiene ninguna línea." }, { status: 400 });
  }

  const lines: {
    productId: number | null;
    variantId: number | null;
    productName: string;
    variantLabel: string | null;
    sku: string | null;
    quantity: string;
    unit: (typeof schema.saleUnitEnum.enumValues)[number];
    note: string | null;
  }[] = [];

  for (const line of rawLines) {
    const productName = optionalString(line.productName);
    const quantity = Number(line.quantity);
    const unit = typeof line.unit === "string" ? line.unit : "";
    if (!productName) {
      return NextResponse.json({ error: "Falta el producto en una línea." }, { status: 400 });
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Cantidad inválida en una línea." }, { status: 400 });
    }
    if (!VALID_UNITS.has(unit)) {
      return NextResponse.json({ error: "Unidad inválida en una línea." }, { status: 400 });
    }
    lines.push({
      productId: optionalId(line.productId),
      variantId: optionalId(line.variantId),
      productName,
      variantLabel: optionalString(line.variantLabel),
      sku: optionalString(line.sku),
      quantity: quantity.toFixed(2),
      unit: unit as (typeof schema.saleUnitEnum.enumValues)[number],
      note: optionalString(line.note),
    });
  }

  // The reference (e.g. "P-1024") is the paper workflow's missing unique id (ADR-0020).
  // Reserving the id via nextval() before inserting keeps `reference` NOT NULL always —
  // no nullable-then-update step — and needs no row count that could race under concurrent
  // submissions.
  const reference = await db.transaction(async (tx) => {
    const [{ nextval }] = (await tx.execute(
      sql`SELECT nextval('requests_id_seq')`,
    )) as unknown as { nextval: string }[];
    const id = Number(nextval);
    const reference = `P-${id}`;

    await tx.insert(schema.requests).values({
      id,
      reference,
      businessName,
      contactPhone,
      contactEmail,
      note: generalNote,
    });

    await tx.insert(schema.requestLines).values(
      lines.map((line) => ({ ...line, requestId: id })),
    );

    return reference;
  });

  return NextResponse.json({ reference }, { status: 201 });
}
