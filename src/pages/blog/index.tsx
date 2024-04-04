import { Link } from 'waku';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { getMetaData, groupedByDate } from '../../utils/index.js'
import { Meta } from '../../components/meta.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function BlogPage() {
  const blogList = await getBlogList();

  return (
    <>
      <Meta title="Blog | PerfectPan's Blog" description="Blog | PerfectPan's Blog"></Meta>
      <div className="flex flex-col gap-8">
        <div className="mx-auto w-full max-w-[80ch] pt-24 lg:pt-32">
          {blogList.map((group) => {
            return <div key={group.year}>
              <div className="text-3xl mb-4">{group.year}</div>
              {group.blogs.map((blog) => (
                <div key={blog.name} className="mt-2 mb-6 opacity-70 hover:opacity-100">
                  <Link to={`blog/${blog.name}`} className="flex gap-2 items-center">
                    <span className="text-lg leading-[1.2em]">{blog.title}</span>
                    <span className="text-sm opacity-50">{new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}</span>
                  </Link>
                </div>
              ))}
            </div>
          })}
        </div>
        <Link to="/" className="mt-4 inline-block">
          <span className="opacity-70">&gt;&nbsp;&nbsp;&nbsp;</span>
          <span className="underline opacity-70 hover:opacity-100">cd ..</span>
        </Link>
      </div>
    </>
  );
};

const getBlogList = async () => {
  try {
    const blogList = await fs.readdir(path.join(__dirname, '../../../content/blog'), { encoding: 'utf-8' });
    const blogMetaData = await Promise.all(blogList.map(getMetaData))
    return groupedByDate(blogMetaData.map((metaData) => ({ ...metaData, name: path.basename(metaData.name, '.md') })));
  } catch(e) {
    console.error('[PerfectPan] Get Blog List failed', e);
  }
  return [];
};

export const getConfig = async () => {
  return {
    render: 'static',
  };
};
