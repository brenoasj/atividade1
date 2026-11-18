import { isForeignKeyViolation } from "../../src/database/foreign-key-violation";

describe("isForeignKeyViolation", () => {
  test("reconhece o código 23503 na propriedade code", () => {
    expect(isForeignKeyViolation({ code: "23503" })).toBe(true);
  });

  test.each([null, undefined, "23505", 23503, {}, { code: "outro" }])(
    "rejeita %p",
    (value) => {
      expect(isForeignKeyViolation(value)).toBe(false);
    },
  );
});
