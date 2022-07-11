import Pagination from "../ui/pagination";

const Products = () => {
  return (
    <div className="flex flex-col items-center gap-y-4">
      <div className="flex w-full p-4">
        <div className="w-full grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="productCard">
                Product {i + 1}
              </div>
            ))}
        </div>
      </div>

      <Pagination queryKey="page" pages={5} />
    </div>
  );
};

export default Products;
