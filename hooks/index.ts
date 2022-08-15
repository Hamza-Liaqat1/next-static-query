import { useRouter } from "next/router";
// import qs, { ParsedQs } from "qs";
import { ParsedUrlQuery } from "querystring";
import { useCallback, useEffect, useRef, useState } from "react";

interface TransitionOptions {
  isShallow?: boolean;
  isScroll?: boolean;
  removeKeys?: string[];
}

const valueDelimiter = "_";
const keyValueDelimiter = "=";
const queryPartsDelimiter = ";";

const getQueryPart = (routerQuery: string | string[], position: number = 1) => {
  return Array.isArray(routerQuery) ? routerQuery[position] : routerQuery;
};

const getRestQuery = (routerQuery: string | string[], position: number = 1) => {
  return Array.isArray(routerQuery)
    ? routerQuery.slice(0, position)
    : undefined;
};

const createQuery = (newQueryPath: string, restQuery?: string | string[]) => {
  return Array.isArray(restQuery)
    ? restQuery.concat(newQueryPath)
    : newQueryPath;
};

const createLink = (pathname: string, query: string) => {
  return pathname.replace(/\[[^\]]*]/, encodeURI(query));
};

/**
 * @summary Detect is query exist
 * @param {string} exclude exclude key from search - can be page
 * @param {string} nextKey Next query key
 * @param {number} position on next route position
 * @return {boolean} IsQuery exist
 */
export function useIsQueryExist(
  exclude?: string,
  nextKey: string = "params",
  position: number = 1
) {
  const router = useRouter();
  const [isExist, setIsExist] = useState<boolean>(false);

  useEffect(() => {
    const routerQuery = router.query[nextKey];

    if (!routerQuery) {
      setIsExist(false);
      return;
    }

    if (Array.isArray(routerQuery) && !routerQuery[position]) {
      setIsExist(false);
      return;
    }

    setIsExist(isQueryExits(getQueryPart(routerQuery, position), exclude));
  }, [exclude, nextKey, position, router.query, router.query.params]);

  return [isExist] as const;
}

/**
 * @summary Detect query existing, with optional key exclude
 * @param {string} queryPart string query
 * @param {string} exclude exclude key from detection
 * @return {boolean}
 */
export const isQueryExits = (queryPart?: string, exclude?: string) => {
  if (queryPart === undefined) {
    return false;
  }

  if (exclude && queryPart.includes(exclude)) {
    const parts = queryPart.split(queryPartsDelimiter);
    return parts.length - 1 > 0;
  }

  return true;
};

/**
 * @summary Remove only QUERY part
 * @param {string} nextKey
 * @param {number} position
 * @return {[callback]} Clear async function
 */
export function useClearQuery(
  nextKey: string = "params",
  position: number = 1
) {
  const router = useRouter();

  const handleClear = async (options?: TransitionOptions) => {
    const nextQueryPart = router.query[nextKey];

    if (!nextQueryPart) {
      return;
    }

    const isExist = isQueryExits(getQueryPart(nextQueryPart, position));

    if (!isExist) {
      return;
    }

    await router.push(
      {
        pathname: router.pathname,
        query: { [nextKey]: getRestQuery(nextQueryPart, position) },
      },
      undefined,
      {
        shallow: options?.isShallow,
        scroll: options?.isScroll,
      }
    );
  };

  return [handleClear] as const;
}

/**
 * @summary Hook for client side routing and query manipulation
 * @param {string} key Query key
 * @param {@generic} initialValue initial value
 * @param {string} nextKey Default params - Next dynamic route name [...params] or others
 * @param {string} position If dynamic route with catch all then you must specify query position
 * @description If dynamic route with catch all then you must specify query position
 * @description for example /route/dynamic_category/query so position 1 because next creates query.params = [dynamic_category, query]
 * @return {[query, callback]} Return useState like tuple with first state and change state function
 */
export function usePathQuery<T extends number | string | string[]>(
  key: string,
  initialValue: T,
  nextKey: string = "params",
  position: number = 1
) {
  const router = useRouter();
  const [query, setQuery] = useState<T>(initialValue);
  const { current: initialValueRef } = useRef(initialValue);

  useEffect(() => {
    const initializeQuery = () => {
      setQuery(initialValueRef);
    };

    const routerQuery = router.query[nextKey];

    if (!routerQuery) {
      initializeQuery();
      return;
    }

    const queryPart = getQueryPart(routerQuery, position);

    if (!queryPart) {
      initializeQuery();
      return;
    }

    const initialQuery = convertToQuery(queryPart);
    if (!initialQuery || !initialQuery[key]) {
      initializeQuery();
      return;
    }

    const value = initialQuery[key];
    if (!value) {
      initializeQuery();
      return;
    }

    switch (typeof initialValueRef) {
      case "number": {
        if (typeof value !== "string" || isNaN(parseInt(value, 10))) {
          initializeQuery();
          return;
        }

        const numberValue = parseInt(value, 10) as T;
        setQuery(numberValue);
        return;
      }

      case "string": {
        if (typeof value !== "string") {
          initializeQuery();
          return;
        }
        setQuery(value as T);
        return;
      }
    }

    if (Array.isArray(initialValueRef)) {
      let valuesArray: string[];

      if (typeof value === "string") {
        valuesArray = [value];
      } else {
        valuesArray = value as string[];
      }

      setQuery(valuesArray as T);
      return;
    }
  }, [initialValueRef, key, nextKey, position, router.query]);

  const changeQuery = useCallback(
    async (newValue: typeof initialValue, options?: TransitionOptions) => {
      const routerQuery = router.query[nextKey];

      const parsedValue =
        typeof newValue === "number"
          ? newValue.toString()
          : (newValue as string | string[]);

      if (!routerQuery) {
        const newQuery = convertQueryToPath({ [key]: parsedValue });
        await router.push({ query: { [nextKey]: newQuery } }, undefined, {
          shallow: options?.isShallow,
          scroll: options?.isScroll,
        });
        return;
      }

      const restQuery = getRestQuery(routerQuery, position);
      const queryPart = getQueryPart(routerQuery, position);

      if (!queryPart) {
        const newQueryPath = convertQueryToPath({ [key]: parsedValue });
        const newQuery = createQuery(newQueryPath, restQuery);

        await router.push({ query: { [nextKey]: newQuery } }, undefined, {
          shallow: options?.isShallow,
          scroll: options?.isScroll,
        });
        return;
      }

      const freshQuery = convertToQuery(queryPart);

      if (Array.isArray(parsedValue)) {
        if (!parsedValue.some((c) => !!c)) {
          delete freshQuery[key];
          const updatedQueryPath = convertQueryToPath(freshQuery);

          setQuery(newValue);

          const newQuery = createQuery(updatedQueryPath, restQuery);

          await router.push({ query: { [nextKey]: newQuery } }, undefined, {
            shallow: options?.isShallow,
            scroll: options?.isScroll,
          });
          return;
        }
      }

      freshQuery[key] = parsedValue;

      if (options?.removeKeys && options.removeKeys.some((k) => !!k)) {
        options.removeKeys.forEach((keyToRemove) => {
          delete freshQuery[keyToRemove];
        });
      }

      const newQueryPath = convertQueryToPath(freshQuery);
      const newQuery = createQuery(newQueryPath, restQuery);

      await router.push({ query: { [nextKey]: newQuery } }, undefined, {
        shallow: options?.isShallow,
        scroll: options?.isScroll,
      });
    },
    [key, nextKey, position, router]
  );

  return [query, changeQuery] as const;
}

/**
 * @summary Create string link for query key without deleting other query params
 * @param {string} nextKey Default params - Next dynamic route name [...params] or others
 * @param {string} position If dynamic route with catch all then you must specify query position
 * @description If dynamic route with catch all then you must specify query position
 * @description for example /route/dynamic_category/query so position 1 because next creates query.params = [dynamic_category, query]
 * @return {string} Link
 */
export function useGetQueryPath<T extends number | string | string[]>(
  nextKey: string = "params",
  position: number = 1
) {
  const router = useRouter();

  const getQueryPath = (
    nextValue: T,
    key: string,
    removeKeys?: string[]
  ): string => {
    const path = router.pathname;
    const routerQuery = router.query[nextKey];

    const parsedValue =
      typeof nextValue === "number"
        ? nextValue.toString()
        : (nextValue as string | string[]);

    if (!routerQuery) {
      const newQuery = convertQueryToPath({ [key]: parsedValue });
      return createLink(path, newQuery);
    }

    const restQuery = getRestQuery(routerQuery, position);
    const queryPart = getQueryPart(routerQuery, position);

    if (!queryPart) {
      const newQueryPath = convertQueryToPath({ [key]: parsedValue });
      const newQuery = createQuery(newQueryPath, restQuery);

      const parsedPath = Array.isArray(newQuery)
        ? newQuery.join("/")
        : newQuery;

      return createLink(path, parsedPath);
    }

    const freshQuery = convertToQuery(queryPart);

    freshQuery[key] = parsedValue;

    if (removeKeys && removeKeys.some((k) => !!k)) {
      removeKeys.forEach((keyToRemove) => {
        delete freshQuery[keyToRemove];
      });
    }

    const newQueryPath = convertQueryToPath(freshQuery);
    const newQuery = createQuery(newQueryPath, restQuery);

    const parsedPath = Array.isArray(newQuery) ? newQuery.join("/") : newQuery;

    return createLink(path, parsedPath);
  };

  return { getQueryPath } as const;
}

/**
 * @summary Convert path to query
 * @param {string} path
 * @return {ParsedUrlQuery} Query
 */
export function convertToQuery(path: string): ParsedUrlQuery {
  const decodedPath = decodeURI(path);

  const queryParts = decodedPath.split(queryPartsDelimiter);
  const query: ParsedUrlQuery = {};

  queryParts.forEach((part) => {
    const lastIndex = part.lastIndexOf(keyValueDelimiter);
    const key = part.substring(0, lastIndex);
    const value = part.substring(lastIndex + 1);

    if (value.includes(valueDelimiter)) {
      query[key] = value.split(valueDelimiter);
    } else {
      query[key] = value;
    }
  });
  return query;
}

/**
 * @summary Create path from query with key and values sort for predictable URL
 * @description My custom parser
 * @param {ParsedUrlQuery} query Query
 * @return {string} path
 */
export function convertQueryToPath(query: ParsedUrlQuery) {
  const stringsQuery: string[] = [];
  for (const [key, value] of Object.entries(query).sort((a, b) => {
    if (a[0][0] < b[0][0]) return -1;
    if (a[0][0] > b[0][0]) return 1;
    return 0;
  })) {
    if (typeof value === "string") {
      stringsQuery.push(`${key}${keyValueDelimiter}${value}`);
    }

    if (Array.isArray(value)) {
      stringsQuery.push(
        `${key}${keyValueDelimiter}${value
          .sort((a, b) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
          })
          .join(valueDelimiter)}`
      );
    }
  }

  return stringsQuery.join(queryPartsDelimiter);
}

/**
 * @summary Use custom convert to query function
 * @description for example qs library
 * @param {string} path string query
 * @return {ParsedQs} parsed qs format
 */
// export function convertToQuery(path: string) {
//   return qs.parse(path, {
//     ignoreQueryPrefix: true,
//     depth: 1,
//     delimiter: queryPartsDelimiter,
//   });
// }

/**
 * @summary Use custom convert to path function
 * @description qs supports only key sort
 * @param {ParsedQs | ParsedUrlQuery} query Query
 * @return {string} Parsed query
 */
// export function convertQueryToPath(query: ParsedQs | ParsedUrlQuery) {
//   return qs.stringify(query, {
//     delimiter: queryPartsDelimiter,
//     encodeValuesOnly: true,
//     sort: function alphabeticalSort(a, b) {
//       return a.localeCompare(b);
//     },
//   });
// }
