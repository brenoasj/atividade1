import { StudentsService } from "../../../src/modules/students/students.service";
import type { StudentRepository } from "../../../src/modules/students/students.repository";

describe("StudentsService", () => {
  let repository: jest.Mocked<StudentRepository>;
  let service: StudentsService;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    service = new StudentsService(repository);
  });

  test("cria estudante válido", async () => {
    const created = { ra: 123, name: "Ana" };
    repository.create.mockResolvedValue(created);

    await expect(service.create({ ra: 123, name: "Ana" })).resolves.toEqual(created);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith({ ra: 123, name: "Ana" });
  });

  test("rejeita RA inválido sem consultar o repositório", async () => {
    await expect(service.create({ ra: 0, name: "Ana" })).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  test("traduz RA duplicado para 409", async () => {
    repository.create.mockRejectedValue({ code: "23505" });

    await expect(service.create({ ra: 123, name: "Ana" })).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  test("retorna 404 para estudante inexistente", async () => {
    repository.findOne.mockResolvedValue(undefined);

    await expect(service.findOne(123)).rejects.toMatchObject({ statusCode: 404 });
    expect(repository.findOne).toHaveBeenCalledWith(123);
  });

  test("propaga exatamente o Error inesperado da criação", async () => {
    const error = new Error("falha criação");
    repository.create.mockRejectedValue(error);

    await expect(service.create({ ra: 123, name: "Ana" })).rejects.toBe(error);
  });

  test("lista estudantes", async () => {
    const students = [{ ra: 123, name: "Ana" }];
    repository.findAll.mockResolvedValue(students);

    await expect(service.findAll()).resolves.toEqual(students);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  test("busca estudante existente", async () => {
    const student = { ra: 123, name: "Ana" };
    repository.findOne.mockResolvedValue(student);

    await expect(service.findOne(123)).resolves.toEqual(student);
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123);
  });
});
