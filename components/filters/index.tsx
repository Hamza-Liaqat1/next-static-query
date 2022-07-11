import Chip from "../ui/chip";
import { useIsQueryExist, useClearQuery, usePathQuery } from "../../hooks";
import { query } from "../../static-data/query";

const colors = ["blue", "yellow", "indigo", "orange"];
const sortOptions = ["new", "priceLow", "priceHigh"];

const Filters = () => {
  const [isExist] = useIsQueryExist();
  const [clear] = useClearQuery();

  const clearAllQuery = async () => {
    await clear();
  };

  return (
    <div className="flex flex-col gap-y-8 p-4">
      {isExist && (
        <button
          type="button"
          onClick={clearAllQuery}
          className="p-2 border rounded"
        >
          Clear query
        </button>
      )}
      <Sort />
      <ColorsFilter />
    </div>
  );
};
export default Filters;

// Example of multi filter selection
const ColorsFilter = () => {
  const [selectedColors, setSelectedColors] = usePathQuery<string[]>(
    query.color,
    []
  );

  // Check value in array
  const isSelected = (value: string) => {
    return selectedColors.indexOf(value) !== -1;
  };

  // Default multi selection: check if exist - remove is not - add
  const handleSelected = async (value: string) => {
    const curIndex = selectedColors.indexOf(value);
    const newSelected = [...selectedColors];

    if (curIndex === -1) {
      newSelected.push(value);
    } else {
      newSelected.splice(curIndex, 1);
    }

    // When we change filters, the page with the selected number may not exist anymore after filtering,
    // so when we work with this filter, we remove the page from the query to be on the initial page of filtering
    await setSelectedColors(newSelected, {
      removeKeys: [query.page],
      isShallow: false,
      isScroll: false,
    });
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {colors.map((color) => (
        <Chip
          key={color}
          value={color}
          onSelect={handleSelected}
          selected={isSelected(color)}
        />
      ))}
    </div>
  );
};

// Simple single value sort option
export const Sort = () => {
  const [selectedOption, setSelectedOption] = usePathQuery<string>(
    query.sort,
    sortOptions[0]
  );

  // For sort option no need to clear page because count of product don't change
  const handleSelectedSort = async (selectedSort: string) => {
    await setSelectedOption(selectedSort, { isScroll: false });
  };

  return (
    <div className="flex flex-col gap-4 flex-wrap">
      {sortOptions.map((option) => (
        <Chip
          key={option}
          value={option}
          onSelect={handleSelectedSort}
          selected={option === selectedOption}
        />
      ))}
    </div>
  );
};
