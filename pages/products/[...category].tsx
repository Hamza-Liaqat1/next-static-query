import { GetStaticPaths, GetStaticProps } from "next";
import Products from "../../components/products";
import { ParsedUrlQuery } from "querystring";
import Filters from "../../components/filters";

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
        <span className="p-4">
          {JSON.stringify(queryFromGetStaticProps, null, 2)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-12">
      <div className="flex flex-col gap-y-4">
        {getTopInfo}
        <div className="flex items-start flex-wrap gap-4">
          <div className="grow md:basis-2/12">
            <Filters />
          </div>
          <div className="grow md:basis-8/12 w-full">
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
  const pathToQuery = await import("../../hooks").then(
    (m) => m.convertPathToQuery
  );

  // Get category from url
  const category = context?.params?.category && context.params.category[0];
  if (!category) {
    return { notFound: true };
  }

  let query: ParsedUrlQuery = {};
  // Get other part of url path and if exist try to parse query
  const queryParams = context?.params?.category && context.params.category[1];
  if (queryParams) {
    query = pathToQuery(queryParams);
  }

  // Fetch products by category and query params and pass to page props...

  // For the example, I'm wiring the category and the query itself to the page
  const data: ProductPage = {
    selectedCategory: category,
    queryFromGetStaticProps: query,
  };

  return {
    props: { ...data },
  };
};
