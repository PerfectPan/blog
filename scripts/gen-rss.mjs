import fs from 'fs';
import path from 'path';
import { Feed } from "feed";
import { remark } from 'remark';
import frontmatter from 'remark-frontmatter';
import yaml from 'yaml';

const feed = new Feed({
  title: "PerfectPan",
  description: "PerfectPan's Website",
  id: "https://perfectpan.org/",
  link: "https://perfectpan.org/",
  language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
  copyright: "All rights reserved 2024, PerfectPan",
  author: {
    name: "PerfectPan",
    link: "https://perfectpan.org/"
  }
});

const blogList = fs.readdirSync('./content/blog');

blogList.forEach((blog) => {
  const source = fs.readFileSync(`./content/blog/${blog}`, 'utf8');
  let metadata = {};
  remark()
    .use(frontmatter)
    .use(() => (tree) => {
      const yamlNode = tree.children.find((node) => node.type === 'yaml');
      if (yamlNode) {
        const data = yaml.parse(yamlNode.value);
        metadata = data;
      }
    })
    .process(source, function(err) {
      if (err) {
        reject(err);
      }

      feed.addItem({
        title: metadata.title,
        id: `https://perfectpan.org/blog/${path.basename(blog, '.md')}`,
        link: `https://perfectpan.org/blog/${path.basename(blog, '.md')}`,
        description: metadata.description,
        // TODO: need mdx to html, otherwise it will parse fail
        // content: source,
        author: [
          {
            name: "PerfectPan",
            email: "perfectpan325@gmail.com",
            link: "https://perfectpan.org/"
          },
        ],
        date: new Date(metadata.date),
      });
    });
})

fs.writeFileSync('./.vercel/output/static/rss.xml', feed.atom1());
