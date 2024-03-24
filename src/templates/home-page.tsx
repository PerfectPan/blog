import { Link } from 'waku';

export const HomePage = async () => {
  const data = await getData();

  return (
    <div className="flex flex-col items-center">
      <title>{data.title}</title>
      <img className="m-0" src="/images/xm.jpg"/>
      <div className="mt-8 text-[2.5rem]">
        是个什么都不会的废物.jpg
      </div>
      <div className="flex w-full justify-around">
        <div className="leading-[5rem] flex-1 border-0 text-center cursor-pointer uppercase tracking-wider mx-1 bg-gray-100 font-semibold rounded-md mt-8">
          <Link
            to="/blog"
          >
            Blog
          </Link>
        </div>
        <div className="leading-[5rem] flex-1 border-0 text-center cursor-pointer uppercase tracking-wider mx-1 bg-gray-100 font-semibold rounded-md mt-8">
          <a
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
            }}
            target="blank"
            href="https://github.com/PerfectPan"
          >
            Project
          </a>
        </div>
      </div>
    </div>
  );
};

const getData = async () => {
  const data = {
    title: 'Home | PerfectPan\'s Blog',
  };

  return data;
};
