import fs from 'node:fs/promises';
import { remark } from 'remark';
import frontmatter from 'remark-frontmatter';
import yaml from 'yaml';
import { withResolver } from './promise.js';

interface BlogMetaData {
  date: string;
  title: string;
  description: string;
  name: string;
  tag?: string[];
}

export const getMetaData = async (path: string) => {
  const source = await fs.readFile(`./content/blog/${path}`, 'utf8');
  const { promise, resolve, reject } = withResolver<BlogMetaData>();
  remark()
    .use(frontmatter)
    .use(() => (tree) => {
      const yamlNode = (tree as any).children.find((node: any) => node.type === 'yaml');
      if (yamlNode) {
        const data = yaml.parse(yamlNode.value);
        resolve({ ...data, name: path });
      }
    })
    .process(source, function(err) {
      if (err) {
        reject(err);
      }
    });

  return promise;
}
