import Pagination from "../ui/pagination";

const Products = () => {
  return (
    <div className="flex flex-col items-center gap-y-4">
      <div>Products</div>
      <Pagination queryKey="page" pages={5} />
    </div>
  );
};

export default Products;
