import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';

export const loader = async (_args: LoaderFunctionArgs) => {
  return { title: "Home | PerfectPan's Blog" };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.title ?? "PerfectPan's Blog";
  return [
    { title },
    { name: 'description', content: title },
    { property: 'og:title', content: title },
    { property: 'og:description', content: title },
  ];
};

export default function HomePage() {
  return (
    <div className='flex flex-col items-center'>
      <img className='m-0' src='/images/xm.jpg' alt='' />
      <div className='mt-8 text-[2.5rem] font-black'>
        是个什么都不会的废物.jpg
      </div>
      <div className='flex w-full justify-around dark:text-black'>
        <div className='bg-gray-50 shadow-lg leading-[5rem] flex-1 border-0 text-center cursor-pointer uppercase tracking-wider mx-1 font-semibold rounded-md mt-8 dark:bg-wash-dark dark:text-white dark:opacity-70'>
          <Link to='/blog'>Blog</Link>
        </div>
        <div className='bg-gray-50 shadow-lg leading-[5rem] flex-1 border-0 text-center cursor-pointer uppercase tracking-wider mx-1 font-semibold rounded-md mt-8 dark:bg-wash-dark dark:text-white dark:opacity-70'>
          <a
            style={{
              boxShadow: 'none',
              textDecoration: 'none',
              color: 'inherit',
            }}
            target='blank'
            href='https://github.com/PerfectPan'
          >
            Project
          </a>
        </div>
      </div>
    </div>
  );
}
