import { GetStaticPaths, GetStaticProps } from "next";
import Products from "../../components/products";
import { ParsedUrlQuery } from "querystring";
import Filters from "../../components/filters";
import { query } from "../../static-data/query";

interface ProductPage {
  selectedCategory: string;
  queryFromGetStaticProps: ParsedUrlQuery;
}

export default function ProductsPage({
  selectedCategory,
  queryFromGetStaticProps,
}: ProductPage) {
  // Show some data
  const getTopInfo = (
    <div className="p-2">
      <h1 className="text-xl text-gray-700 font-medium">
        Category: {selectedCategory}
      </h1>
      <div className="flex flex-col gap-y-4">
        <span>Query parsed from getStaticProps:</span>
        <p className="whitespace-pre-wrap">
          {JSON.stringify(queryFromGetStaticProps, null, 2)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-12">
      <div className="flex flex-col gap-y-4">
        <div className="flex items-start flex-wrap gap-4">
          <div className="grow md:basis-2/12">{getTopInfo}</div>
          <div className="grow md:basis-2/12">
            <Filters />
          </div>
          <div className="grow md:basis-7/12 w-full">
            <Products />
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

// !!! The most important thing is that you can turn an SSG into an SSR
// by simply commenting out getStaticPaths and renaming the getServerSideProps function since one query format is used

export const getStaticProps: GetStaticProps = async (context) => {
  const pathToQuery = await import("../../hooks").then((m) => m.convertToQuery);

  // Your utils to right query interpretation before request data
  const myHandyQueryUtils = await import("../../utils/query");

  // Get category from url
  const category = context?.params?.params && context.params.params[0];
  if (!category) {
    return { notFound: true };
  }

  let parsedQuery: ParsedUrlQuery = {};
  // Get other part of url path and if exist try to parse query
  const queryParams = context?.params?.params && context.params.params[1];
  if (queryParams) {
    parsedQuery = pathToQuery(queryParams);
  }

  const paginationInfo = myHandyQueryUtils.getPagination(
    parsedQuery,
    query.page
  );
  const sortInfo = myHandyQueryUtils.getProductsSort(parsedQuery);
  const colors = myHandyQueryUtils.getMultiValue(parsedQuery, query.color);

  console.log(
    `Server side Pagination: ${JSON.stringify(paginationInfo, null, 2)}`
  );
  console.log(`Server side Sort value ${JSON.stringify(sortInfo, null, 2)}`);

  console.log(`Server side Colors" ${JSON.stringify(colors, null, 2)}`);

  // Fetch products by category and prepared query params and pass to page props...

  // For the example, I'm wiring the category and the query itself to the page
  const data: ProductPage = {
    selectedCategory: category,
    queryFromGetStaticProps: parsedQuery,
  };

  return {
    props: { ...data },
  };
};
