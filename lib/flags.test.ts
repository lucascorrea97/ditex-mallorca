import { describe, expect, it } from "vitest";
import { hiddenRoutePrefixes, isHiddenPath } from "@/lib/flags";

// The parity route gate (M0, ADR-0021 / #83). isHiddenPath is the single predicate the
// proxy, sitemap and nav filter all delegate to, so its boundary behaviour is what keeps
// "hidden means unreachable" and "parity pages stay reachable" honest — test it directly
// rather than spinning up the request pipeline.

describe("isHiddenPath — locale-agnostic parity gate", () => {
  it("hides each configured prefix exactly", () => {
    for (const prefix of hiddenRoutePrefixes) {
      expect(isHiddenPath(prefix)).toBe(true);
    }
  });

  it("hides sub-routes of a hidden prefix", () => {
    expect(isHiddenPath("/catalogo/espuma")).toBe(true);
    expect(isHiddenPath("/catalogo/buscar")).toBe(true);
    expect(isHiddenPath("/catalogo/coleccion/verano")).toBe(true);
    expect(isHiddenPath("/catalogo/producto/foo-bar")).toBe(true);
    expect(isHiddenPath("/guias/como-cortar-espuma")).toBe(true);
  });

  it("keeps the parity surface reachable", () => {
    expect(isHiddenPath("/")).toBe(false);
    expect(isHiddenPath("/nosotros")).toBe(false);
    expect(isHiddenPath("/servicios")).toBe(false);
    expect(isHiddenPath("/productos")).toBe(false);
    expect(isHiddenPath("/contacto")).toBe(false);
    expect(isHiddenPath("/aviso-legal")).toBe(false);
  });

  it("keeps the Client Area itself visible while hiding only its request flow", () => {
    // The boundary that matters most: area-clientes stays (it's parity), solicitud goes.
    expect(isHiddenPath("/area-clientes")).toBe(false);
    expect(isHiddenPath("/area-clientes/acceder")).toBe(false);
    expect(isHiddenPath("/area-clientes/solicitud")).toBe(true);
    expect(isHiddenPath("/area-clientes/solicitud/revisar")).toBe(true);
  });

  it("does not treat a sibling that merely starts with a hidden prefix as hidden", () => {
    // "/catalogo-x" is not "/catalogo" nor a "/catalogo/" sub-route.
    expect(isHiddenPath("/catalogo-demo")).toBe(false);
    expect(isHiddenPath("/guias-extra")).toBe(false);
  });
});
