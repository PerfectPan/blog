import { createServerFn } from '@tanstack/react-start';
import { renderPostHtml } from './markdown-html.js';

/**
 * About copy. Single edit point — change the markdown here and push; no CMS,
 * no database rows behind this page. zh and en live side by side; the route
 * picks by UI locale (both are pre-rendered so a guest switching language
 * client-side swaps instantly). Head metadata stays untranslated.
 *
 * Server-side module: the markdown strings and the react-markdown pipeline
 * they feed never enter the client bundle. The route imports only the
 * server fn below.
 */

const ABOUT_MD = `## 关于我

我是 **PerfectPan**，一个喜欢折腾的开发者。写代码，也写字 —— 这里记录我在工程、工具和日常折腾中踩过的坑与想明白的事。

- **开源**：维护一些小工具，比如 Logseq 插件、Rust 写的 CLI、agent 相关的小玩具，完整列表见 \`~/projects\`。
- **订阅**：通过 [RSS](/rss.xml) 关注更新，或到 [GitHub](https://github.com/PerfectPan) 找到我。
`;

/** English version of ABOUT_MD — same structure, translated in place. */
const ABOUT_MD_EN = `## About Me

I'm **PerfectPan**, a developer who loves to tinker. I write code, and I write too — this is where I keep the pitfalls I've stumbled into and the things I've managed to figure out, in engineering, tooling, and everyday hacking.

- **Open source**: I maintain a handful of small tools — Logseq plugins, a Rust CLI, little agent-related toys. The full list lives at \`~/projects\`.
- **Subscribe**: follow along via [RSS](/rss.xml), or find me on [GitHub](https://github.com/PerfectPan).
`;

/** Renders once per request through the shared post pipeline. SSR-only in
 *  practice: the HTML lands in the loader data, the browser hydrates it as a
 *  single node (this page used to ship react-markdown + katex to the client
 *  for two short paragraphs). */
export const getAboutHtmlServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return {
      htmlZh: renderPostHtml(ABOUT_MD, 'zh'),
      htmlEn: renderPostHtml(ABOUT_MD_EN, 'en'),
    };
  },
);
