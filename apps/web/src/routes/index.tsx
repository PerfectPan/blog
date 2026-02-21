import { Link, createFileRoute } from '@tanstack/react-router';

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
      <div className='flex w-full justify-around dark:text-black'>
        <div className='mx-1 mt-8 flex-1 cursor-pointer rounded-md border-0 bg-gray-50 text-center font-semibold uppercase tracking-wider leading-[5rem] shadow-lg dark:bg-wash-dark dark:text-white dark:opacity-70'>
          <Link to='/blog'>Blog</Link>
        </div>
        <div className='mx-1 mt-8 flex-1 cursor-pointer rounded-md border-0 bg-gray-50 text-center font-semibold uppercase tracking-wider leading-[5rem] shadow-lg dark:bg-wash-dark dark:text-white dark:opacity-70'>
          <a
            style={{
              boxShadow: 'none',
              textDecoration: 'none',
              color: 'inherit',
            }}
            target='_blank'
            rel='noreferrer'
            href='https://github.com/PerfectPan'
          >
            Project
          </a>
        </div>
      </div>
    </div>
  );
}
