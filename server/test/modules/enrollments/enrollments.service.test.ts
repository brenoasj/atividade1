import { EnrollmentsService } from "../../../src/modules/enrollments/enrollments.service";
import type { EnrollmentRepository } from "../../../src/modules/enrollments/enrollments.repository";

describe("EnrollmentsService", () => {
  let repository: jest.Mocked<EnrollmentRepository>;
  let service: EnrollmentsService;
  const enrolledAt = new Date("2026-01-15T10:00:00.000Z");

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    service = new EnrollmentsService(repository);
  });

  test("cria matrícula válida", async () => {
    const enrollment = { studentRa: 123, courseId: 1, enrolledAt };
    repository.create.mockResolvedValue(enrollment);

    await expect(service.create({ studentRa: 123, courseId: 1 })).resolves.toEqual(enrollment);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(123, 1);
  });

  test.each([
    { studentRa: 0, courseId: 1 },
    { studentRa: 123, courseId: 0 },
  ])("rejeita chave inválida %p sem consultar o repositório", async (input) => {
    await expect(service.create(input)).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.create).not.toHaveBeenCalled();
  });

  test("traduz referência inexistente para 404", async () => {
    repository.create.mockRejectedValue({ code: "23503" });

    await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test("traduz matrícula duplicada para 409", async () => {
    repository.create.mockRejectedValue({ code: "23505" });

    await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  test("retorna 404 para matrícula inexistente", async () => {
    repository.findOne.mockResolvedValue(undefined);

    await expect(service.findOne(123, 1)).rejects.toMatchObject({ statusCode: 404 });
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123, 1);
  });

  test("propaga exatamente o Error inesperado da criação", async () => {
    const error = new Error("falha criação matrícula");
    repository.create.mockRejectedValue(error);

    await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toBe(error);
  });

  test("lista matrículas", async () => {
    const enrollments = [{ studentRa: 123, courseId: 1, enrolledAt }];
    repository.findAll.mockResolvedValue(enrollments);

    await expect(service.findAll()).resolves.toEqual(enrollments);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  test("busca matrícula existente", async () => {
    const enrollment = { studentRa: 123, courseId: 1, enrolledAt };
    repository.findOne.mockResolvedValue(enrollment);

    await expect(service.findOne(123, 1)).resolves.toEqual(enrollment);
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123, 1);
  });
});
