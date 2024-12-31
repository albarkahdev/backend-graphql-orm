import PageEntity from '../../src/entities/PageEntity';
import PortfolioEntity from '../../src/entities/PortfolioEntity';
import PortfolioVersionEntity from '../../src/entities/PortfolioVersionEntity';
import createApolloServer from '../test_helpers/createApolloServer';
import createPageEntity from '../test_helpers/createPageHelper';
import createPortfolioEntity from '../test_helpers/createPortfolioHelper';
import createPortfolioVersionEntity from '../test_helpers/createPortfolioVersionHelper';

describe('PageResolver', () => {
  const QUERY_LIST_PAGES = `
    query ListPages($versionId: Int!) {
      listPages(versionId: $versionId) {
        id
        name
        url
      }
    }
  `;

  const MUTATION_ADD_PAGE = `
    mutation AddPage($name: String!, $url: String!, $versionId: Int!) {
      addPage(name: $name, url: $url, versionId: $versionId) {
        id
        name
        url
      }
    }
  `;

  const MUTATION_UPDATE_PAGE = `
    mutation UpdatePage($id: Int!, $name: String, $url: String, $versionId: Int) {
      updatePage(id: $id, name: $name, url: $url, versionId: $versionId) {
        id
        name
        url
      }
    }
  `;

  const MUTATION_DELETE_PAGE = `
    mutation DeletePage($id: Int!) {
      deletePage(id: $id)
    }
  `;

  let portfolio: PortfolioEntity;
  let version1: PortfolioVersionEntity;
  let version2: PortfolioVersionEntity;
  let page1: PageEntity;

  beforeAll(async () => {
    portfolio = await createPortfolioEntity();
    version1 = await createPortfolioVersionEntity({ portfolio });
    version2 = await createPortfolioVersionEntity({ portfolio });
    page1 = await createPageEntity({ version: version1 });
    await createPageEntity({ version: version2 });
  });

  test('list pages', async () => {
    const server = createApolloServer();
    const response = await server.executeOperation({
      query: QUERY_LIST_PAGES,
      variables: { versionId: version1.id },
    });
    expect(response).toGraphQLResponseData({
      listPages: [
        {
          id: page1.id,
          name: page1.name,
          url: page1.url,
        },
      ],
    });
  });

  test('add page', async () => {
    const server = createApolloServer();
    const response = await server.executeOperation({
      query: MUTATION_ADD_PAGE,
      variables: {
        name: 'New Page',
        url: 'http://newpage.com',
        versionId: version1.id,
      },
    });
    expect(response).toGraphQLResponseData({
      addPage: {
        id: 3,
        name: 'New Page',
        url: 'http://newpage.com',
      },
    });
  });

  test('update page', async () => {
    const server = createApolloServer();
    const response = await server.executeOperation({
      query: MUTATION_UPDATE_PAGE,
      variables: {
        id: 3,
        name: 'Updated Page',
        url: 'http://updatedpage.com',
      },
    });
    expect(response).toGraphQLResponseData({
      updatePage: {
        id: 3,
        name: 'Updated Page',
        url: 'http://updatedpage.com',
      },
    });
  });

  test('delete page', async () => {
    const server = createApolloServer();
    const response = await server.executeOperation({
      query: MUTATION_DELETE_PAGE,
      variables: { id: 3 },
    });

    expect(response).toGraphQLResponseData({
      deletePage: true,
    });

    const responseAll = await server.executeOperation({
      query: QUERY_LIST_PAGES,
      variables: { versionId: version1.id },
    });
    expect(responseAll).toGraphQLResponseData({
      listPages: [
        {
          id: page1.id,
          name: page1.name,
          url: page1.url,
        },
      ],
    });
  });
});
