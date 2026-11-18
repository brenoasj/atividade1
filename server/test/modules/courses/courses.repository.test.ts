import type { Database } from "../../../src/database/connection";
import { PgCourseRepository } from "../../../src/modules/courses/courses.repository";

const normalize = (sql: string) => sql.replace(/\s+/g, " ").trim();

describe("PgCourseRepository", () => {
  let query: jest.Mock;
  let repository: PgCourseRepository;

  beforeEach(() => {
    query = jest.fn();
    repository = new PgCourseRepository({ query } as unknown as Database);
  });

  test("create retorna a linha inserida e envia SQL e parâmetros", async () => {
    const created = { id: 7, name: "Qualidade" };
    query.mockResolvedValue({ rows: [created] });

    await expect(repository.create({ name: "Qualidade" })).resolves.toEqual(created);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalize(query.mock.calls[0][0])).toBe(
      "INSERT INTO courses (name) VALUES ($1) RETURNING id, name",
    );
    expect(query.mock.calls[0][1]).toEqual(["Qualidade"]);
  });

  test("findAll retorna registros e envia seleção ordenada", async () => {
    const courses = [{ id: 7, name: "Qualidade" }];
    query.mockResolvedValue({ rows: courses });

    await expect(repository.findAll()).resolves.toEqual(courses);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalize(query.mock.calls[0][0])).toBe(
      "SELECT id, name FROM courses ORDER BY id",
    );
    expect(query.mock.calls[0]).toHaveLength(1);
  });

  test("findAll retorna lista vazia", async () => {
    query.mockResolvedValue({ rows: [] });
    await expect(repository.findAll()).resolves.toEqual([]);
  });

  test("findOne retorna a primeira linha encontrada", async () => {
    const course = { id: 7, name: "Qualidade" };
    query.mockResolvedValue({ rows: [course] });

    await expect(repository.findOne(7)).resolves.toEqual(course);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalize(query.mock.calls[0][0])).toBe(
      "SELECT id, name FROM courses WHERE id = $1",
    );
    expect(query.mock.calls[0][1]).toEqual([7]);
  });

  test("findOne retorna undefined quando não há linhas", async () => {
    query.mockResolvedValue({ rows: [] });
    await expect(repository.findOne(7)).resolves.toBeUndefined();
  });

  test("create propaga a mesma falha do banco", async () => {
    const error = new Error("falha create");
    query.mockRejectedValue(error);
    await expect(repository.create({ name: "Qualidade" })).rejects.toBe(error);
  });

  test("findAll propaga a mesma falha do banco", async () => {
    const error = new Error("falha listagem");
    query.mockRejectedValue(error);
    await expect(repository.findAll()).rejects.toBe(error);
  });

  test("findOne propaga a mesma falha do banco", async () => {
    const error = new Error("falha busca");
    query.mockRejectedValue(error);
    await expect(repository.findOne(7)).rejects.toBe(error);
  });
});
