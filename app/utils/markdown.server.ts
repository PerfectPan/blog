import fs from 'node:fs/promises';
import path from 'node:path';
import { remark } from 'remark';
import frontmatter from 'remark-frontmatter';
import yaml from 'yaml';
import { withResolver } from './promise';

export interface BlogMetaData {
  date: string;
  title: string;
  description: string;
  name: string;
  tag?: string[];
}

export const getMetaData = async (fileName: string) => {
  const absolutePath = path.join(process.cwd(), 'content', 'blog', fileName);
  const source = await fs.readFile(absolutePath, 'utf8');
  const { promise, resolve, reject } = withResolver<BlogMetaData>();
  remark()
    .use(frontmatter)
    .use(() => (tree) => {
      // biome-ignore lint/suspicious/noExplicitAny: mdast node type is hard
      const yamlNode = (tree as any).children.find(
        // biome-ignore lint/suspicious/noExplicitAny: mdast node type is hard
        (node: any) => node.type === 'yaml',
      );
      if (yamlNode) {
        const data = yaml.parse(yamlNode.value);
        resolve({ ...data, name: fileName });
      }
    })
    .process(source, (err) => {
      if (err) {
        reject(err);
      }
    });

  return promise;
};
