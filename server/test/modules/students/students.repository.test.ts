import type { Database } from "../../../src/database/connection";
import { PgStudentRepository } from "../../../src/modules/students/students.repository";

const normalize = (sql: string) => sql.replace(/\s+/g, " ").trim();

describe("PgStudentRepository", () => {
  let query: jest.Mock;
  let repository: PgStudentRepository;

  beforeEach(() => {
    query = jest.fn();
    repository = new PgStudentRepository({ query } as unknown as Database);
  });

  test("create retorna a linha inserida e envia SQL e parâmetros", async () => {
    const created = { ra: 123, name: "Ana" };
    query.mockResolvedValue({ rows: [created] });

    await expect(repository.create({ ra: 123, name: "Ana" })).resolves.toEqual(created);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalize(query.mock.calls[0][0])).toBe(
      "INSERT INTO students (ra, name) VALUES ($1, $2) RETURNING ra, name",
    );
    expect(query.mock.calls[0][1]).toEqual([123, "Ana"]);
  });

  test("findAll retorna registros e envia seleção ordenada", async () => {
    const students = [{ ra: 123, name: "Ana" }];
    query.mockResolvedValue({ rows: students });

    await expect(repository.findAll()).resolves.toEqual(students);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalize(query.mock.calls[0][0])).toBe(
      "SELECT ra, name FROM students ORDER BY name",
    );
    expect(query.mock.calls[0]).toHaveLength(1);
  });

  test("findAll retorna lista vazia", async () => {
    query.mockResolvedValue({ rows: [] });
    await expect(repository.findAll()).resolves.toEqual([]);
  });

  test("findOne retorna a primeira linha encontrada", async () => {
    const student = { ra: 123, name: "Ana" };
    query.mockResolvedValue({ rows: [student] });

    await expect(repository.findOne(123)).resolves.toEqual(student);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalize(query.mock.calls[0][0])).toBe(
      "SELECT ra, name FROM students WHERE ra = $1",
    );
    expect(query.mock.calls[0][1]).toEqual([123]);
  });

  test("findOne retorna undefined quando não há linhas", async () => {
    query.mockResolvedValue({ rows: [] });
    await expect(repository.findOne(123)).resolves.toBeUndefined();
  });

  test("create propaga a mesma falha do banco", async () => {
    const error = new Error("falha create");
    query.mockRejectedValue(error);
    await expect(repository.create({ ra: 123, name: "Ana" })).rejects.toBe(error);
  });

  test("findAll propaga a mesma falha do banco", async () => {
    const error = new Error("falha listagem");
    query.mockRejectedValue(error);
    await expect(repository.findAll()).rejects.toBe(error);
  });

  test("findOne propaga a mesma falha do banco", async () => {
    const error = new Error("falha busca");
    query.mockRejectedValue(error);
    await expect(repository.findOne(123)).rejects.toBe(error);
  });
});
