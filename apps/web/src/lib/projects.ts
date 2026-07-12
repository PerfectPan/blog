export type Project = {
  /** Display name of the project. */
  name: string;
  /** One-line description shown under the title. */
  description: string;
  /** Primary tech stack / tags. */
  tags: string[];
  /** Source repository URL. */
  repo: string;
  /** Optional live demo / homepage URL. */
  demo?: string;
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
    name: 'blog',
    description:
      '本博客 —— TanStack Start 前台，全量部署在 Cloudflare Workers + D1 上。',
    tags: ['TanStack Start', 'Cloudflare', 'TypeScript'],
    repo: 'https://github.com/PerfectPan/blog',
    demo: 'https://perfectpan.org',
    featured: true,
  },
  {
    name: 'logseq-plugin-code-formatter',
    description:
      'Logseq 插件 —— 用 Prettier 一键格式化代码块，支持 JS / TS / HTML / CSS / Markdown / JSON。',
    tags: ['TypeScript', 'Logseq', 'Prettier'],
    repo: 'https://github.com/PerfectPan/logseq-plugin-code-formatter',
    featured: true,
  },
  {
    name: 'ocvm',
    description:
      'OpenClaw 版本管理器 —— nvm 风格的 Rust CLI，按项目安装、切换、锁定与回滚 OpenClaw 版本。',
    tags: ['Rust', 'CLI'],
    repo: 'https://github.com/PerfectPan/ocvm',
    demo: 'https://ocvm.vercel.app',
  },
  {
    name: 'agent-presence',
    description:
      '把本地编码 agent（Codex / Claude Code / Gemini CLI 等）的在线状态与 token 用量同步到飞书签名链接预览。',
    tags: ['TypeScript', 'CLI', 'Feishu'],
    repo: 'https://github.com/PerfectPan/agent-presence',
    demo: 'https://agent-presence.vercel.app',
  },
  {
    name: 'base64',
    description: 'Moonbit 语言实现的 Base64 编解码库，遵循 RFC 4648。',
    tags: ['Moonbit'],
    repo: 'https://github.com/PerfectPan/base64',
  },
];
