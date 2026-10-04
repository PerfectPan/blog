import type { Locale } from '@blog/shared';

/** Copy that exists in both UI languages; the page picks a side by locale. */
export type LocalizedText = Record<Locale, string>;

export type Project = {
  /** Display name of the project. */
  name: string;
  /** One-line description shown under the title, per UI locale. */
  description: LocalizedText;
  /** Primary tech stack / tags. */
  tags: string[];
  /** Source repository URL. */
  repo: string;
  /** Optional live demo / homepage URL. */
  demo?: string;
  /** Custom label for the `demo` link (defaults to "demo"), e.g. 官网 for a landing page. */
  demoLabel?: LocalizedText;
  /** Mark a couple of projects as featured to pin them to the top. */
  featured?: boolean;
};

/**
 * Curated list of personal projects shown on `/projects`.
 *
 * This is intentionally hardcoded (no GitHub API, no CMS): editing this file
 * and pushing is the entire workflow for adding/removing a project.
 */
export const PROJECTS: Project[] = [
  {
    name: 'logseq-plugin-code-formatter',
    description: {
      zh: 'Logseq 插件 —— 用 Prettier 一键格式化代码块，支持 JS / TS / HTML / CSS / Markdown / JSON。',
      en: 'Logseq plugin — format code blocks with Prettier in one click. Supports JS / TS / HTML / CSS / Markdown / JSON.',
    },
    tags: ['TypeScript', 'Logseq', 'Prettier'],
    repo: 'https://github.com/PerfectPan/logseq-plugin-code-formatter',
    featured: true,
  },
  {
    name: 'ocvm',
    description: {
      zh: 'OpenClaw 版本管理器 —— nvm 风格的 Rust CLI，按项目安装、切换、锁定与回滚 OpenClaw 版本。',
      en: 'OpenClaw version manager — an nvm-style Rust CLI to install, switch, pin, and roll back OpenClaw versions per project.',
    },
    tags: ['Rust', 'CLI'],
    repo: 'https://github.com/PerfectPan/ocvm',
    demo: 'https://ocvm.vercel.app',
  },
  {
    name: 'agent-presence',
    description: {
      zh: '把本地编码 agent（Codex / Claude Code / Gemini CLI 等）的在线状态与 token 用量同步到飞书签名链接预览。',
      en: 'Syncs the online presence and token usage of local coding agents (Codex / Claude Code / Gemini CLI, etc.) to a Feishu signature link preview.',
    },
    tags: ['TypeScript', 'CLI', 'Feishu'],
    repo: 'https://github.com/PerfectPan/agent-presence',
    demo: 'https://agent-presence.vercel.app',
    demoLabel: { zh: '官网', en: 'site' },
  },
  {
    name: 'svgo.mbt',
    description: {
      zh: '用 MoonBit 实现的 SVG 优化器，提供库、WebAssembly 模块和命令行工具。',
      en: 'An SVG optimizer written in MoonBit, available as a library, WebAssembly module, and CLI.',
    },
    tags: ['MoonBit', 'SVG', 'WebAssembly'],
    repo: 'https://github.com/PerfectPan/svgo.mbt',
    demo: 'https://perfectpan.github.io/svgo.mbt/',
    demoLabel: { zh: '在线体验', en: 'playground' },
  },
];
