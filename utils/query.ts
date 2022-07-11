import { ParsedUrlQuery } from "querystring";
import { query } from "../static-data/query";

// So now you can write some handy utils to right parse some data for example pagination

// This function helps to leave the final logic of the query parsing up to you, that is,
// even if you switch from SSG to SSR you will just pass the standard query
// object into the function regardless of the type of query pathQuery or good old ?key=value&key=value

// This feature will also help protect against dirty requests
export const getPagination = (
  parsedQuery: ParsedUrlQuery,
  queryKey: string
): { page: number } => {
  const pageQuery = parsedQuery[queryKey];
  let page = 1;
  if (pageQuery && typeof pageQuery === "string") {
    if (!isNaN(parseInt(pageQuery, 10))) {
      const parsedPage = parseInt(pageQuery, 10);
      page = parsedPage <= 0 ? 1 : parsedPage;
    }
  }

  return { page };
};

// Check and transform query to  what you need to query your API
export const getProductsSort = (parsedQuery: ParsedUrlQuery) => {
  let defaultSort = ["sortByDate:asc"];
  const sortOption = parsedQuery[query.sort];
  if (sortOption && typeof sortOption === "string") {
    if (sortOption === "new") {
      defaultSort = ["sortByDate:asc"];
    }

    if (sortOption === "priceLow") {
      defaultSort = ["sortByPrice:asc"];
    }

    if (sortOption === "priceHigh") {
      defaultSort = ["sortByPrice:desc"];
    }
  }

  return defaultSort;
};

// Just get check and get multi value
export const getMultiValue = (parsedQuery: ParsedUrlQuery, key: string) => {
  let list: string[] = [];
  const finalQuery = parsedQuery[key];
  if (finalQuery) {
    if (typeof finalQuery === "string") {
      list = [finalQuery];
    } else {
      list = finalQuery;
    }
  }

  return list.sort((a, b) => a.localeCompare(b));
};