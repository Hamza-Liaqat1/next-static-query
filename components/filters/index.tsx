import Chip from "../ui/chip";

const colors = ["blue", "yellow", "indigo", "orange"];

const Filters = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <ColorsFilter />
    </div>
  );
};
export default Filters;

const ColorsFilter = () => {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {colors.map((color) => (
        <Chip key={color} value={color} onSelect={() => {}} />
      ))}
    </div>
  );
};
