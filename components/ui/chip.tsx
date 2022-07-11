import cl from "classnames";
import XIcon from "@heroicons/react/outline/XIcon";

export interface ISelectable<T> {
  value: T;
  selected?: boolean;
  onSelect: (selected: T) => void;
  disabled?: boolean;
}

interface ChipProps extends ISelectable<string> {
  withClose?: boolean;
}

const Chip = ({
  value,
  selected,
  onSelect,
  withClose,
  disabled,
}: ChipProps) => {
  return (
    <button
      className={cl("px-4 py-2 rounded-full text-gray-200 shadow text-base", {
        [`bg-indigo-500 text-white`]: selected && !disabled,
        [`text-gray-200 text-gray-300 pointer-events-none`]: disabled,
        ["deceased"]: disabled,
      })}
      onClick={() => onSelect(value)}
      type="button"
      title={value}
    >
      {value}
      {withClose && <XIcon className={process.env.chipCross} />}
    </button>
  );
};

export default Chip;
