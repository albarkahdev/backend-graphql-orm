import { Resolver, Query, Mutation, InputType, Arg, Int, Field } from 'type-graphql';
import { getRepository } from 'typeorm';
import { Service } from 'typedi';
import PortfolioVersionEntity from '../entities/PortfolioVersionEntity';
import PageEntity from '../entities/PageEntity';
import PortfolioEntity from '../entities/PortfolioEntity';

@InputType()
class PageInput {
  @Field()
  name: string;

  @Field()
  url: string;
}

@Resolver()
@Service()
export default class ListPortfolioVersionsResolver {
  private portfolioRepository = getRepository(PortfolioEntity);

  private portfolioVersionRepository = getRepository(PortfolioVersionEntity);

  private pageRepository = getRepository(PageEntity);

  /**
   * List all versions for a given portfolio
   * @param portfolioId - ID of the portfolio
   * @returns Array of PortfolioVersionEntity objects
   */
  @Query(() => [PortfolioVersionEntity], { description: 'List all versions for a given portfolio' })
  async listPortfolioVersions(@Arg('portfolioId', () => Int) portfolioId: number): Promise<PortfolioVersionEntity[]> {
    return this.portfolioVersionRepository.find({
      where: { portfolio: portfolioId },
      relations: ['pages', 'portfolio'],
    });
  }

  /**
   * Add a new version to a portfolio
   * @param portfolioId - ID of the portfolio
   * @param versionType - Type of the version
   * @param pages - Array of pages to add tothe version (optionl)
   * @returns The newly created PortfolioVersionEntity object
   */
  @Mutation(() => PortfolioVersionEntity)
  async addPortfolioVersion(
    @Arg('portfolioId', () => Int) portfolioId: number,
    @Arg('versionType') versionType: string,
    @Arg('pages', () => [PageInput], { nullable: true }) pages?: PageInput[]
  ): Promise<PortfolioVersionEntity> {
    const portfolio = await this.portfolioRepository.findOne(portfolioId);

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const version = new PortfolioVersionEntity();
    version.portfolio = portfolio;
    version.versionType = versionType;

    const savedVersion = await this.portfolioVersionRepository.save(version);

    if (pages) {
      const pageEntities = pages.map((page) => {
        const pageEntity = new PageEntity();
        pageEntity.name = page.name;
        pageEntity.url = page.url;
        pageEntity.version = savedVersion;
        return pageEntity;
      });

      await this.pageRepository.save(pageEntities);
    }

    return savedVersion;
  }

  /**
   * Update an existing portfolio version
   * @param id - ID of the portfolio version
   * @param versionType - New type ofthe version (optionl)
   * @param pages - Array of pages toupdate the version with (optionl)
   * @returns The updated PortfolioVersionEntity object
   */
  @Mutation(() => PortfolioVersionEntity)
  async updatePortfolioVersion(
    @Arg('id', () => Int) id: number,
    @Arg('versionType', { nullable: true }) versionType?: string,
    @Arg('pages', () => [PageInput], { nullable: true }) pages?: PageInput[]
  ): Promise<PortfolioVersionEntity | null> {
    const portfolioVersion = await this.portfolioVersionRepository.findOne(id, { relations: ['pages', 'portfolio'] });

    if (!portfolioVersion) {
      throw new Error('PortfolioVersion not found');
    }

    if (versionType !== undefined) {
      portfolioVersion.versionType = versionType;
    }

    if (pages !== undefined) {
      await this.pageRepository.delete({ version: portfolioVersion });
      const pageEntities = pages.map((page) => {
        const pageEntity = new PageEntity();
        pageEntity.name = page.name;
        pageEntity.url = page.url;
        pageEntity.version = portfolioVersion;
        return pageEntity;
      });
      portfolioVersion.pages = await this.pageRepository.save(pageEntities);
    }

    return this.portfolioVersionRepository.save(portfolioVersion);
  }

  /**
   * Delete an existing portfolio version
   * @param id - ID of the portfolio version to delete
   * @returns Boolean indicating the success of the operation
   */
  @Mutation(() => Boolean)
  async deletePortfolioVersion(@Arg('id', () => Int) id: number): Promise<boolean> {
    const version = await this.portfolioVersionRepository.findOne(id);

    if (!version) {
      throw new Error('PortfolioVersion not found');
    }

    await this.portfolioVersionRepository.remove(version);
    return true;
  }
}
