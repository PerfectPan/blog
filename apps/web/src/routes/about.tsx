import { createFileRoute, Link } from '@tanstack/react-router';
import { Markdown } from '../components/markdown.js';
import { Page, Prompt } from '../components/page.js';
import { BODY_ENTER_DELAY_MS, ENTER, enterDelay } from '../components/term.js';
import { useLocale } from '../lib/i18n/context.js';

/**
 * About copy. Single edit point — change the markdown here and push; no CMS,
 * no database rows behind this page. zh and en live side by side and the page
 * picks by UI locale; head metadata stays untranslated.
 *
 * NOTE: content below is a first draft for the page launch — the site owner
 * should rewrite it in their own voice.
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

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: "About | PerfectPan's Blog" },
      { name: 'description', content: '关于 PerfectPan 与这个博客' },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { locale } = useLocale();
  return (
    <Page>
      <Prompt user='perfectpan' host='blog' cwd='~ %' typed>
        cat ~/about.md
      </Prompt>
      <div className={ENTER} style={enterDelay(BODY_ENTER_DELAY_MS)}>
        <Markdown content={locale === 'en' ? ABOUT_MD_EN : ABOUT_MD} />
      </div>
      <Prompt user='perfectpan' host='blog' cwd='~ %' className='mt-6'>
        <Link to='/' className='text-muted-foreground hover:text-primary'>
          cd ~
        </Link>
      </Prompt>
    </Page>
  );
}
