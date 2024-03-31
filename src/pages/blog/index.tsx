import { Link } from 'waku';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { getMetaData } from '../../utils/index.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function BlogPage() {
  const blogList = await getBlogList();

  return (
    <div className="flex flex-col gap-8">
      <div className="mx-auto w-full max-w-[80ch] pt-20 lg:pt-24">
        {blogList.map((blog) => {
          return <div key={blog.name}>
            <Link to={`blog/${blog.name}`}>{blog.name}</Link>
          </div>
        })}
      </div>
      <Link to="/" className="mt-4 inline-block underline">
        cd ..
      </Link>
    </div>
  );
};

const getBlogList = async () => {
  try {
    const blogList = await fs.readdir(path.join(__dirname, '../../../content/blog'), { encoding: 'utf-8' });
    const blogMetaData = await Promise.all(blogList.map(getMetaData))
    return blogMetaData.map((metaData) => ({ ...metaData, name: path.basename(metaData.name, '.md') }));
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
