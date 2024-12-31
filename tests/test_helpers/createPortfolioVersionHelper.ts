import faker from 'faker';
import { DeepPartial, getRepository } from 'typeorm';
import PortfolioVersionEntity from '../../src/entities/PortfolioVersionEntity';

export function buildPortfolioVersionEntity(properties?: DeepPartial<PortfolioVersionEntity>) {
  const repository = getRepository(PortfolioVersionEntity);

  return repository.create({
    versionType: faker.lorem.word(),
    ...properties,
  });
}

async function createPortfolioVersionEntity(properties?: DeepPartial<PortfolioVersionEntity>) {
  const repository = getRepository(PortfolioVersionEntity);
  return repository.save(buildPortfolioVersionEntity(properties));
}

export default createPortfolioVersionEntity;
