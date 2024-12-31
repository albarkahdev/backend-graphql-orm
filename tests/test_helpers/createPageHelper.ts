import faker from 'faker';
import { DeepPartial, getRepository } from 'typeorm';
import PageEntity from '../../src/entities/PageEntity';

export function buildPageEntity(properties?: DeepPartial<PageEntity>) {
  const repository = getRepository(PageEntity);

  return repository.create({
    name: faker.name.findName(),
    url: faker.internet.url(),
    ...properties,
  });
}

async function createPageEntity(properties?: DeepPartial<PageEntity>) {
  const repository = getRepository(PageEntity);
  return repository.save(buildPageEntity(properties));
}

export default createPageEntity;
