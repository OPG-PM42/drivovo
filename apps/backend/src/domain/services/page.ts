import { type CarPageEntity, carPageSchema } from "@drivovo/domain";
import { type BaseService, type Dependencies, DOMAIN_ERRORS, DomainError } from "./service";

type PageService = BaseService<CarPageEntity>;

function validateId(id: string) {
  const result = carPageSchema.shape.id.safeParse(id);
  if (!result.success) {
    throw new DomainError(DOMAIN_ERRORS.VALIDATION_ERROR, `Invalid id: ${id}`);
  }
}

function validate(entity: CarPageEntity, { partial = false }: { partial?: boolean } = {}) {
  const schema = partial 
    ? carPageSchema.partial()
    : carPageSchema.omit({ id: true });
  const result = schema.safeParse(entity);
  if (!result.success) {
    throw new DomainError(
      DOMAIN_ERRORS.VALIDATION_ERROR,
      result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    );
  }
}

export default ({ repositories: repos }: Dependencies): PageService => ({
  getAll: () => repos.pages.find(),
  getById: async (id: string) => {
    validateId(id);
    const page = await repos.pages.findOne(id);
    if (!page)
      throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `Page with id ${id} not found`);
    return page;
  },
  create: async (entity: CarPageEntity) => {
    validate(entity);
    const id = await repos.pages.insert(entity);
    if (!id)
      throw new DomainError(DOMAIN_ERRORS.UNKNOWN_ERROR, `Failed to create page`);
    return id;
  },
  update: async (entity: CarPageEntity) => {
    validateId(entity.id);
    validate(entity, { partial: true });
    const id = await repos.pages.update(entity);
    if (!id)
      throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `Page with id ${entity.id} not found`);
    return id;
  },
  delete: async (id: string) => {
    validateId(id);
    const deletedId = await repos.pages.delete(id);
    if (!deletedId)
      throw new DomainError(DOMAIN_ERRORS.NOT_FOUND, `Page with id ${id} not found`);
    return deletedId;
  },
});