import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import PortfolioEntity from './PortfolioEntity';
import PageEntity from './PageEntity';

@ObjectType('PortfolioVersion')
@Entity()
export default class PortfolioVersionEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('varchar', { nullable: false })
  versionType: string;

  @Field(() => PageEntity)
  @ManyToOne(() => PortfolioEntity, (portfolio) => portfolio.versions, { nullable: false })
  portfolio: PortfolioEntity;

  @Field(() => [PageEntity])
  @OneToMany(() => PageEntity, (page) => page.version)
  pages: PageEntity[];
}
