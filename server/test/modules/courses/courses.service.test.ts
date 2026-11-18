import { CoursesService } from "../../../src/modules/courses/courses.service";
import type { CourseRepository } from "../../../src/modules/courses/courses.repository";

function createRepository(): jest.Mocked<CourseRepository> {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };
}

describe("CoursesService", () => {
  let repository: jest.Mocked<CourseRepository>;
  let service: CoursesService;

  beforeEach(() => {
    repository = createRepository();
    service = new CoursesService(repository);
  });

  test("cria um curso válido", async () => {
    const created = { id: 7, name: "Qualidade" };
    repository.create.mockResolvedValue(created);

    await expect(service.create({ name: "Qualidade" })).resolves.toEqual(created);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith({ name: "Qualidade" });
  });

  test.each([null, {}, { name: "A" }])("rejeita criação inválida %p", async (input) => {
    await expect(service.create(input)).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.create).not.toHaveBeenCalled();
  });

  test("traduz nome duplicado para 409", async () => {
    repository.create.mockRejectedValue({ code: "23505" });

    await expect(service.create({ name: "Qualidade" })).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  test("lista cursos usando stub e confirma uma única chamada", async () => {
    const courses = [{ id: 7, name: "Qualidade" }];
    repository.findAll.mockResolvedValue(courses);

    await expect(service.findAll()).resolves.toEqual(courses);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  test("busca curso existente", async () => {
    const course = { id: 123, name: "Qualidade" };
    repository.findOne.mockResolvedValue(course);

    await expect(service.findOne(123)).resolves.toEqual(course);
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123);
  });

  test("retorna 404 para curso inexistente", async () => {
    repository.findOne.mockResolvedValue(undefined);

    await expect(service.findOne(123)).rejects.toMatchObject({ statusCode: 404 });
  });

  test("rejeita identificador 0 sem consultar o repositório", async () => {
    await expect(service.findOne(0)).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  test("propaga falha inesperada na criação", async () => {
    const error = new Error("falha create");
    repository.create.mockRejectedValue(error);
    await expect(service.create({ name: "Qualidade" })).rejects.toBe(error);
  });

  test("propaga falha inesperada na listagem", async () => {
    const error = new Error("falha listagem");
    repository.findAll.mockRejectedValue(error);
    await expect(service.findAll()).rejects.toBe(error);
  });

  test("propaga falha inesperada na busca", async () => {
    const error = new Error("falha busca");
    repository.findOne.mockRejectedValue(error);
    await expect(service.findOne(123)).rejects.toBe(error);
  });

  test("observa findOne com spy em um objeto stub", async () => {
    const stub = {
      create: jest.fn().mockResolvedValue({ id: 1, name: "Qualidade" }),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 1, name: "Qualidade" }),
    };
    const spy = jest.spyOn(stub, "findOne");
    const spyService = new CoursesService(stub);

    await expect(spyService.findOne(1)).resolves.toEqual({ id: 1, name: "Qualidade" });
    expect(spy).toHaveBeenCalledWith(1);
  });

  test("remove campos extras antes de enviar ao repositório", async () => {
    const created = { id: 7, name: "Qualidade" };
    repository.create.mockResolvedValue(created);

    await service.create({ name: "Qualidade", extra: true });
    expect(repository.create).toHaveBeenCalledWith({ name: "Qualidade" });
  });
});
