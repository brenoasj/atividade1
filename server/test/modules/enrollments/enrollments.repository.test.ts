import type { Database } from "../../../src/database/connection";
import { PgEnrollmentRepository } from "../../../src/modules/enrollments/enrollments.repository";

const normalize = (sql: string) => sql.replace(/\s+/g, " ").trim();

describe("PgEnrollmentRepository", () => {
  let query: jest.Mock;
  let repository: PgEnrollmentRepository;
  const enrolledAt = new Date("2026-01-15T10:00:00.000Z");

  beforeEach(() => {
    query = jest.fn();
    repository = new PgEnrollmentRepository({ query } as unknown as Database);
  });

  test("create retorna a linha inserida com aliases camelCase", async () => {
    const created = { studentRa: 123, courseId: 7, enrolledAt };
    query.mockResolvedValue({ rows: [created] });

    await expect(repository.create(123, 7)).resolves.toEqual(created);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalize(query.mock.calls[0][0])).toBe(
      'INSERT INTO enrollments (student_ra, course_id) VALUES ($1, $2) RETURNING student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt"',
    );
    expect(query.mock.calls[0][1]).toEqual([123, 7]);
  });

  test("findAll retorna registros camelCase e envia seleção ordenada", async () => {
    const enrollments = [{ studentRa: 123, courseId: 7, enrolledAt }];
    query.mockResolvedValue({ rows: enrollments });

    await expect(repository.findAll()).resolves.toEqual(enrollments);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalize(query.mock.calls[0][0])).toBe(
      'SELECT student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt" FROM enrollments ORDER BY student_ra, course_id',
    );
    expect(query.mock.calls[0]).toHaveLength(1);
  });

  test("findAll retorna lista vazia", async () => {
    query.mockResolvedValue({ rows: [] });
    await expect(repository.findAll()).resolves.toEqual([]);
  });

  test("findOne retorna a primeira matrícula encontrada", async () => {
    const enrollment = { studentRa: 123, courseId: 7, enrolledAt };
    query.mockResolvedValue({ rows: [enrollment] });

    await expect(repository.findOne(123, 7)).resolves.toEqual(enrollment);
    expect(query).toHaveBeenCalledTimes(1);
    expect(normalize(query.mock.calls[0][0])).toBe(
      'SELECT student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt" FROM enrollments WHERE student_ra = $1 AND course_id = $2',
    );
    expect(query.mock.calls[0][1]).toEqual([123, 7]);
  });

  test("findOne mantém os nomes camelCase e a data simulada", async () => {
    const enrollment = { studentRa: 123, courseId: 7, enrolledAt };
    query.mockResolvedValue({ rows: [enrollment] });

    await expect(repository.findOne(123, 7)).resolves.toEqual(enrollment);
  });

  test("findOne retorna undefined quando não há linhas", async () => {
    query.mockResolvedValue({ rows: [] });
    await expect(repository.findOne(123, 7)).resolves.toBeUndefined();
  });

  test("create propaga a mesma falha do banco", async () => {
    const error = new Error("falha create");
    query.mockRejectedValue(error);
    await expect(repository.create(123, 7)).rejects.toBe(error);
  });

  test("findAll propaga a mesma falha do banco", async () => {
    const error = new Error("falha listagem");
    query.mockRejectedValue(error);
    await expect(repository.findAll()).rejects.toBe(error);
  });

  test("findOne propaga a mesma falha do banco", async () => {
    const error = new Error("falha busca");
    query.mockRejectedValue(error);
    await expect(repository.findOne(123, 7)).rejects.toBe(error);
  });
});
