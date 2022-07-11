import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl">Hi,you can check out the work at this link.</h1>
        <p className="text-xl">
          Pay attention to the url string, to the link when you hover over the
          pagination with filters enabled, to the order of the values and keys.
        </p>
        <Link href="/products/nice-category">
          <a className="text-indigo-600 text-xl">Lets go</a>
        </Link>
      </div>
    </div>
  );
};

export default Home;
