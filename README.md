This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This is an example of SSG working with a complex query via a custom hook.

It's not a perfect solution, but it allows you to switch from SSG to SSR without changing the whole project. Just comment out getStaticPaths and change the getStaticProps function to getServerSideProps and voila, you just switched from static pregeneration to fully working SSR and you don't need to do anything inside the project because it supports single interface ParsedUrlQuery

And of course the main idea is to make complex filters with SSG.

If you're thinking of doing an NPM package that would be great since I don't have a lot of time.

Otherwise, you can clone and copy the hook and use it.

