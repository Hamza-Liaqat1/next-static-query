import dynamic from "next/dynamic";
import React, { useEffect } from "react";
import { useGetQueryPath, usePathQuery } from "../../hooks";
import Link from "next/link";
import cl from "classnames";

const ChevronRightIcon = dynamic(
  () => import("@heroicons/react/outline/ChevronRightIcon")
);
const ChevronLeftIcon = dynamic(
  () => import("@heroicons/react/outline/ChevronLeftIcon")
);

interface PaginationProps extends React.ComponentPropsWithoutRef<"div"> {
  queryKey: string;
  pages: number;
}

// This is a simplified example of pagination, in the real world here comes the meta information that must also be displayed

const StrapiPagination = ({ queryKey, pages = 5 }: PaginationProps) => {
  // We need state, function to change state, and function to generate next link for fully link pagination
  const { getQueryPath } = useGetQueryPath<number>();
  const [selectedPage, setSelectedPage] = usePathQuery<number>(queryKey, 1);

  const isFirst = selectedPage - 1 === 0;
  const isLast = selectedPage + 1 > pages;

  useEffect(() => {
    if (pages === 0) {
      return;
    }

    // try not to come outside max pages
    if (selectedPage > pages) {
      setSelectedPage(1, { isScroll: true }).then();
    }
  }, [pages, selectedPage, setSelectedPage]);

  // Just render pages, and get selected state
  const renderPages = () => {
    return Array(pages)
      .fill(0)
      .map((_, i) => {
        const normalPage = i + 1;
        return (
          <Link
            key={normalPage}
            href={{ pathname: getQueryPath(normalPage, queryKey) }}
          >
            <a
              className={cl("buttonBase", {
                ["!bg-indigo-600 !text-gray-50 pointer-events-none"]:
                  normalPage === selectedPage,
              })}
            >
              {normalPage}
            </a>
          </Link>
        );
      });
  };

  return (
    <nav className="inline-flex gap-x-2">
      <Link
        href={{
          pathname: getQueryPath(selectedPage - 1, queryKey),
        }}
        passHref
      >
        <a
          className={cl("buttonBase", {
            ["!bg-gray-100 pointer-events-none"]: isFirst,
          })}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </a>
      </Link>
      {renderPages()}
      <Link
        href={{
          pathname: getQueryPath(selectedPage + 1, queryKey),
        }}
        passHref
      >
        <a
          className={cl("buttonBase", {
            ["!bg-gray-100 pointer-events-none"]: isLast,
          })}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </a>
      </Link>
    </nav>
  );
};

export default StrapiPagination;
