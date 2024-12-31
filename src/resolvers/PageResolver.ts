import { Resolver, Query, Mutation, Arg, Int } from 'type-graphql';
import { getRepository } from 'typeorm';
import { Service } from 'typedi';
import PageEntity from '../entities/PageEntity';
import PortfolioVersionEntity from '../entities/PortfolioVersionEntity';

@Resolver()
@Service()
export default class ListPagesResolver {
  private pageRepository = getRepository(PageEntity);

  private portfolioVersionRepository = getRepository(PortfolioVersionEntity);

  /**
   * List all pages for a given portfolio version
   * @param versionId - ID of the portfolio version
   * @returns Array of PageEntity objects
   */
  @Query(() => [PageEntity], { description: 'List all pages for a given portfolio version' })
  async listPages(@Arg('versionId', () => Int) versionId: number): Promise<PageEntity[]> {
    return this.pageRepository.find({ where: { version: versionId }, relations: ['version'] });
  }

  /**
   * Add a new page to a portfolio version
   * @param name - Name of the page
   * @param url - URL of the page
   * @param versionId - ID of the portfolio version
   * @returns The newly created PageEntity object
   */
  @Mutation(() => PageEntity)
  async addPage(
    @Arg('name') name: string,
    @Arg('url') url: string,
    @Arg('versionId', () => Int) versionId: number
  ): Promise<PageEntity> {
    const portfolioVersion = await this.portfolioVersionRepository.findOne(versionId);

    if (!portfolioVersion) {
      throw new Error('PortfolioVersion not found');
    }

    const page = new PageEntity();
    page.name = name;
    page.url = url;
    page.version = portfolioVersion;

    const savedPage = await this.pageRepository.save(page);

    return savedPage;
  }

  /**
   * Update an existing page
   * @param id - ID of the page
   * @param name - New name of the page (optional)
   * @param url - New URL of the page (optional)
   * @param versionId - New version ID ofthe page (optionl)
   * @returns The updated PageEntity object
   */
  @Mutation(() => PageEntity)
  async updatePage(
    @Arg('id', () => Int) id: number,
    @Arg('name', { nullable: true }) name?: string,
    @Arg('url', { nullable: true }) url?: string,
    @Arg('versionId', () => Int, { nullable: true }) versionId?: number
  ): Promise<PageEntity | null> {
    const page = await this.pageRepository.findOne(id, { relations: ['version'] });
    if (!page) {
      throw new Error('Page not found');
    }

    if (name !== undefined) {
      page.name = name;
    }

    if (url !== undefined) {
      page.url = url;
    }

    if (versionId !== undefined) {
      const portfolioVersion = await this.portfolioVersionRepository.findOne(versionId, { relations: ['pages'] });

      if (!portfolioVersion) {
        throw new Error('PortfolioVersion not found');
      }

      page.version = portfolioVersion;
    }

    return this.pageRepository.save(page);
  }

  /**
   * Delete an existing page
   * @param id - ID of the page to delete
   * @returns Boolean indicating the success of the operation
   */
  @Mutation(() => Boolean)
  async deletePage(@Arg('id', () => Int) id: number): Promise<boolean> {
    const page = await this.pageRepository.findOne(id);
    if (!page) {
      throw new Error('Page not found');
    }

    await this.pageRepository.remove(page);
    return true;
  }
}
