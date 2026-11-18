import { HttpError } from "../src/errors";
import { parseId, positiveInteger, validateBody, validateName } from "../src/validation";

describe("positiveInteger", () => {
  test.each([1, 2147483647])("aceita o limite válido %p", (value) => {
    expect(positiveInteger(value, "RA")).toBe(value);
  });

  test.each([0, -1, 1.5, NaN, Infinity, 2147483648, "123", null, undefined])(
    "rejeita a entrada inválida %p",
    (value) => {
      expect(() => positiveInteger(value, "RA")).toThrow(HttpError);
      try {
        positiveInteger(value, "RA");
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).statusCode).toBe(400);
      }
    },
  );
});

describe("parseId", () => {
  test.each([
    ["1", 1],
    ["2147483647", 2147483647],
  ])("converte %p para %p", (value, expected) => {
    expect(parseId(value, "RA")).toBe(expected);
  });

  test.each(["1abc", "1.2", "1e2", "", "-1", "0", "2147483648", 123])(
    "rejeita a entrada inválida %p",
    (value) => {
      expect(() => parseId(value, "RA")).toThrow(HttpError);
      try {
        parseId(value, "RA");
      } catch (error) {
        expect((error as HttpError).statusCode).toBe(400);
      }
    },
  );
});

describe("validateName", () => {
  test.each(["Ana", "a".repeat(100)])("aceita o nome válido %p", (value) => {
    expect(validateName(value)).toBe(value);
  });

  test.each(["", "ab", "   ", " a ", "a".repeat(101), 123, null, undefined])(
    "rejeita o nome inválido %p",
    (value) => {
      expect(() => validateName(value)).toThrow(HttpError);
      try {
        validateName(value);
      } catch (error) {
        expect((error as HttpError).statusCode).toBe(400);
      }
    },
  );
});

describe("validateBody", () => {
  test("aceita objeto congelado e retorna a mesma referência", () => {
    const body = Object.freeze({ name: "Ana" });
    expect(validateBody(body)).toBe(body);
  });

  test.each([null, undefined, [], "Ana", 12])("rejeita %p", (value) => {
    expect(() => validateBody(value)).toThrow(HttpError);
    try {
      validateBody(value);
    } catch (error) {
      expect((error as HttpError).statusCode).toBe(400);
    }
  });

  test("aceita campos extras sem alterar o objeto", () => {
    const body = { name: "Ana", extra: true };
    expect(validateBody(body)).toBe(body);
  });
});
