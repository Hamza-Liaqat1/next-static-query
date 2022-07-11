import { useRouter } from "next/router";
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
const pathDelimiter = "/";

// Helper hook - detect any path query
export function useIsQueryExist() {
  const router = useRouter();
  const [isExist, setIsExist] = useState<boolean>(false);

  useEffect(() => {
    const query = getQueryPart(router.asPath);
    if (query !== undefined) {
      setIsExist(true);
    } else {
      setIsExist(false);
    }
  }, [router.asPath]);

  return [isExist] as const;
}

// Helper hook - clear all query
export function useClearQuery() {
  const router = useRouter();
  const isExist = useIsQueryExist();

  const handleClear = async (options?: TransitionOptions) => {
    if (isExist) {
      const clearPath = getPathWithoutQuery(router.asPath);
      await router.push({ pathname: clearPath }, undefined, {
        shallow: options?.isShallow,
        scroll: options?.isScroll,
      });
    }
  };

  return [handleClear] as const;
}

// Main hook
export function usePathQuery<T extends number | string | string[]>(
  key: string,
  initialValue: T
) {
  const router = useRouter();
  const [query, setQuery] = useState<T>(initialValue);
  const { current: initialValueRef } = useRef(initialValue);

  // Initialize query
  useEffect(() => {
    const path = router.asPath;
    const initialQuery = generateInitialQuery(path);

    const initializeQuery = () => {
      setQuery(initialValueRef);
    };

    if (!initialQuery || !initialQuery[key]) {
      initializeQuery();
      return;
    }

    const value = initialQuery[key];

    if (!value) {
      initializeQuery();
      return;
    }

    if (typeof initialValueRef === "number") {
      if (typeof value !== "string" || isNaN(parseInt(value, 10))) {
        initializeQuery();
        return;
      }
      const numberValue = parseInt(value, 10) as T;
      setQuery(numberValue);
      return;
    }

    if (typeof initialValueRef === "string") {
      if (typeof value !== "string") {
        initializeQuery();
        return;
      }
      setQuery(value as T);
      return;
    }

    if (Array.isArray(initialValueRef)) {
      let valuesArray: string[] = [];
      if (typeof value === "string") {
        valuesArray = [value];
      } else {
        valuesArray = value;
      }
      setQuery(valuesArray as T);
      return;
    }
  }, [router, initialValueRef, key]);

  // Change query state with options
  const changeQuery = useCallback(
    async (newValue: typeof initialValue, options?: TransitionOptions) => {
      const path = router.asPath;
      const nowQuery = generateInitialQuery(path);

      // If query don't exist create new query
      if (!nowQuery) {
        let newQueryPath: string = "";
        if (typeof newValue === "number") {
          newQueryPath = convertQueryToPath({ [key]: newValue.toString() });
        } else {
          newQueryPath = convertQueryToPath({ [key]: newValue });
        }
        await router.push(
          { pathname: createPath(path, newQueryPath) },
          undefined,
          { shallow: options?.isShallow, scroll: options?.isScroll }
        );
        return;
      }

      // Clear path and query if new array value is empty
      if (Array.isArray(newValue)) {
        if (!newValue.some((c) => !!c)) {
          delete nowQuery[key];
          const updatedQueryPath = convertQueryToPath(nowQuery);
          setQuery(newValue);
          await router.push(
            { pathname: createPath(path, updatedQueryPath) },
            undefined,
            { shallow: options?.isShallow, scroll: options?.isScroll }
          );
          return;
        }
      }

      // Update query object by key
      if (typeof newValue === "number") {
        nowQuery[key] = newValue.toString();
      } else {
        nowQuery[key] = newValue;
      }

      // Remove keys if needed
      if (options?.removeKeys && options.removeKeys.some((k) => !!k)) {
        options.removeKeys.forEach((keyToRemove) => {
          delete nowQuery[keyToRemove];
        });
      }

      // Create new query and push to router
      const updatedQueryPath = convertQueryToPath(nowQuery);
      await router.push(
        { pathname: createPath(path, updatedQueryPath) },
        undefined,
        { shallow: options?.isShallow, scroll: options?.isScroll }
      );
    },
    [key, router]
  );

  // Get string link for value, useful when need to calculate next link without deleting other queries
  const getQueryPath = (
    nextValue: typeof initialValue,
    removeKeys?: string[]
  ): string => {
    const path = router.asPath;
    const nextQuery = generateInitialQuery(path);

    if (!nextQuery) {
      let newQueryPath: string;
      if (typeof nextValue === "number") {
        newQueryPath = convertQueryToPath({ [key]: nextValue.toString() });
      } else {
        newQueryPath = convertQueryToPath({ [key]: nextValue });
      }
      return createPath(path, newQueryPath);
    }

    nextQuery[key] = nextValue.toString();

    if (removeKeys && removeKeys.some((k) => !!k)) {
      removeKeys.forEach((keyToRemove) => {
        delete nextQuery[keyToRemove];
      });
    }

    const updatedQueryPath = convertQueryToPath(nextQuery);
    return createPath(path, updatedQueryPath);
  };

  return [query, changeQuery, getQueryPath] as const;
}

// Path utils for creating hooks

// Create path with new query
const createPath = (stringPath: string, queryPath: string) => {
  return encodeURI(getPathWithoutQuery(stringPath) + queryPath);
};

// Create clear path without query
const getPathWithoutQuery = (stringPath: string) => {
  const decodedPath = decodeURI(stringPath);

  if (decodedPath.includes(keyValueDelimiter)) {
    return decodedPath.substring(0, decodedPath.lastIndexOf(pathDelimiter) + 1);
  } else {
    return decodedPath + pathDelimiter;
  }
};

// Get query from path if exist
const getQueryPart = (stringPath: string) => {
  const decodedPath = decodeURI(stringPath);

  if (decodedPath.includes(keyValueDelimiter)) {
    return decodedPath.substring(decodedPath.lastIndexOf(pathDelimiter) + 1);
  }

  return undefined;
};

// Create query from path
const generateInitialQuery = (stringPath: string) => {
  const queryPart = getQueryPart(stringPath);
  if (queryPart) {
    return convertPathToQuery(queryPart);
  }

  return undefined;
};

// Convert query string to query object, sort query by key for URL Matching
export function convertPathToQuery(path: string): ParsedUrlQuery {
  const decodedPath = decodeURI(path);

  const queryParts = decodedPath.split(queryPartsDelimiter).sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  });
  const query: ParsedUrlQuery = {};

  queryParts.forEach((part) => {
    const lastIndex = part.lastIndexOf(keyValueDelimiter);
    const key = part.substring(0, lastIndex);
    const value = part.substring(lastIndex + 1);

    if (value.includes(valueDelimiter)) {
      query[key] = value.split(valueDelimiter).sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });
    } else {
      query[key] = value;
    }
  });
  return query;
}

// Create string path by query always sort by query key or if query contains multi value sort by value for URL Matching
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
