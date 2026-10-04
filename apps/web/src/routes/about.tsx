import { createFileRoute, Link } from '@tanstack/react-router';
import { MarkdownView } from '../components/markdown-view.js';
import { Page, Prompt } from '../components/page.js';
import { BODY_ENTER_DELAY_MS, ENTER, enterDelay } from '../components/term.js';
import { getAboutHtmlServerFn } from '../lib/about-content.js';
import { useLocale } from '../lib/i18n/context.js';

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: "About | PerfectPan's Blog" },
      { name: 'description', content: '关于 PerfectPan 与这个博客' },
    ],
  }),
  // Both locales are pre-rendered on the worker; the component picks by UI
  // locale. The copy itself lives in lib/about-content.ts (single edit point).
  loader: () => getAboutHtmlServerFn(),
  component: AboutPage,
});

function AboutPage() {
  const { locale } = useLocale();
  const { htmlZh, htmlEn } = Route.useLoaderData();
  return (
    <Page>
      <Prompt user='perfectpan' host='blog' cwd='~ %' typed>
        cat ~/about.md
      </Prompt>
      <div className={ENTER} style={enterDelay(BODY_ENTER_DELAY_MS)}>
        <MarkdownView html={locale === 'en' ? htmlEn : htmlZh} />
      </div>
      <Prompt user='perfectpan' host='blog' cwd='~ %' className='mt-6'>
        <Link to='/' className='text-muted-foreground hover:text-primary'>
          cd ~
        </Link>
      </Prompt>
    </Page>
  );
}
