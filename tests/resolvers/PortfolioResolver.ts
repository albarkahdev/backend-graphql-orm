import { Resolver, Query, Mutation, Arg, Int } from 'type-graphql';
import { getRepository } from 'typeorm';
import { Service } from 'typedi';
import PortfolioEntity from '../entities/PortfolioEntity';

@Resolver()
@Service()
export default class ListPortfoliosResolver {
  private portfolioRepository = getRepository(PortfolioEntity);

  /**
   * List all portfolios
   * @returns Array of PortfolioEntity objects
   */
  @Query(() => [PortfolioEntity], { description: 'List all portfolios' })
  async listPortfolios(): Promise<PortfolioEntity[]> {
    return this.portfolioRepository.find({ relations: ['versions'] });
  }

  /**
   * Add a new portfolio
   * @param name - Name of the portfolio
   * @param url - URL of the portfolio
   * @returns The newly created PortfolioEntity object
   */
  @Mutation(() => PortfolioEntity)
  async addPortfolio(@Arg('name') name: string, @Arg('url') url: string): Promise<PortfolioEntity> {
    const portfolio = new PortfolioEntity();
    portfolio.name = name;
    portfolio.url = url;

    return this.portfolioRepository.save(portfolio);
  }

  /**
   * Update an existing portfolio
   * @param id - ID of the portfolio
   * @param name - New name ofthe portfolio (optionl)
   * @param url - New URL of the portfolio (optional)
   * @returns The updated PortfolioEntity object
   */
  @Mutation(() => PortfolioEntity)
  async updatePortfolio(
    @Arg('id', () => Int) id: number,
    @Arg('name', { nullable: true }) name?: string,
    @Arg('url', { nullable: true }) url?: string
  ): Promise<PortfolioEntity | null> {
    const portfolio = await this.portfolioRepository.findOne(id, { relations: ['versions'] });
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    if (name !== undefined) {
      portfolio.name = name;
    }

    if (url !== undefined) {
      portfolio.url = url;
    }

    return this.portfolioRepository.save(portfolio);
  }

  /**
   * Delete an existing portfolio
   * @param id - ID of the portfolio to delete
   * @returns Boolean indicating the success of the operation
   */
  @Mutation(() => Boolean)
  async deletePortfolio(@Arg('id', () => Int) id: number): Promise<boolean> {
    const portfolio = await this.portfolioRepository.findOne(id);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    await this.portfolioRepository.remove(portfolio);
    return true;
  }
}
