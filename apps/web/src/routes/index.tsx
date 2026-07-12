import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: "Home | PerfectPan's Blog" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className='flex flex-col items-center'>
      <img className='m-0' src='/images/xm.jpg' alt='' />
      <div className='mt-8 text-[2.5rem] font-black'>
        是个什么都不会的废物.jpg
      </div>
      <div className='flex w-full justify-around'>
        <div className='mx-1 mt-8 flex-1 rounded-md bg-slate-100 text-center font-semibold uppercase tracking-wider leading-[5rem] shadow-md transition-shadow hover:shadow-lg dark:bg-wash-dark dark:text-white dark:opacity-80'>
          <Link to='/blog'>Blog</Link>
        </div>
        <div className='mx-1 mt-8 flex-1 rounded-md bg-slate-100 text-center font-semibold uppercase tracking-wider leading-[5rem] shadow-md transition-shadow hover:shadow-lg dark:bg-wash-dark dark:text-white dark:opacity-80'>
          <Link to='/projects'>Projects</Link>
        </div>
      </div>
    </div>
  );
}
