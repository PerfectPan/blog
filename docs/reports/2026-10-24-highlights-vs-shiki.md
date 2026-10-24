# @pierre/highlights vs 现状 shiki Worker 高亮方案 · 对比验证报告

- **日期**：2026-10-24
- **评审对象**：将博客代码高亮引擎从 shiki 3.23.0（浏览器 Web Worker 内懒加载）替换为 `@pierre/highlights` 0.2.0 的可行性、收益与代价。
- **数据来源**：四份材料 —— 材料一（库调研）、材料二（仓库地图）、材料三（体积实测）、材料四（渲染验证）。材料三/四的实测命令与产物有留存（scratch 工程 `/tmp/blog-highlights-spike-size`，含 dist、bench 脚本，可复跑）。
- **修订记录**：v1（2026-10-24）初稿；**v2（2026-10-24）按审读意见修订**——复核通过的数据原样保留（审读复跑 §2.2 支点数字：`rm -rf dist && ./node_modules/.bin/vite build` 构建确定性复现、同 hash `C8lXOoGq`，raw 270,109B / gz 117,061B 精确命中；react-dom 基线 68,277B、shiki 懒链 249,255B gz 亦复现；行号与算术抽查零失手）。修正项：§3.4 颜色表述内部矛盾（审读 #1）、-53% 框架补真实页面取样（#3，新增 §2.5.1）、单位/边界口径（#5，§2.5 重写）、SSR 结论标签过强（#6，§5.4 降级为推断）、§5.3 行数错误 38→19（#9）、估时乐观（#13）、CSP 表述（#11）、import→ready 口径不对称（#12）、glue 两口径差异说明（#10）、npm meta 差异注明（#15）；新增维度：设备前提（#2）、Firefox（#4）、缓存/回访（#7，新增 §2.5.2）、license（#8）；无法复核的生态数据标注 **unconfirmed**（#14）。
- **本报告 v1 撰写时独立复核（2026-10-24 会话）**：
  1. 样张页 `docs/reports/assets/2026-10-24-highlights-samples.html` 存在，576,022 字节（`ls` 实查；审读 `stat` 复核一致）；
  2. 抽查材料引用的 4 处代码行号全部命中（`sed` 逐段核对）：`apps/web/src/components/markdown-highlight.worker.ts:24-73`（LANG_IMPORTS / LANG_ALIASES / resolveLangKey）、`apps/web/src/styles.css:257-262`（`html.dark .shiki` 双主题规则）与 `:413-416`（`html.dark .md pre.th-pre span`）、`apps/web/src/components/markdown-view.tsx:63-82`（upgradeCodeBlock）、`apps/web/src/components/markdown.tsx:45-49`（shiki SSR 打爆免费 CPU 的历史注释，含 1102/503 记录）。审读另对 8+ 处行号复读，100% 命中。
- **本报告 v2 新增实测（2026-10-24 会话，本次修订执行）**：
  1. 行数复核：`sed -n '24,42p' apps/web/src/components/markdown-highlight.worker.ts | wc -l` → **19 行**（LANG_IMPORTS）；`sed -n '46,68p' … | wc -l` → **23 行**（LANG_ALIASES）——修正 v1 §5.3 误写的「38 行」；
  2. **本地 D1 只读取样**（sqlite3 URI `mode=ro`，见 §2.5.1）：76 篇文章、102 个代码块的语言分布；
  3. 远端生产 D1 取样尝试失败：`corepack pnpm --filter @blog/web exec wrangler d1 execute blog --remote --json --command "SELECT count(*) AS n FROM post"` 报「非交互环境需 `CLOUDFLARE_API_TOKEN`」——**远端语言分布 unconfirmed**；
  4. e2e 测试页块数复读（`tests/e2e/markdown-performance.spec.ts:18` count 3、`:51` count 2）；scratch 产物清单复核（`shiki-lazy-DKhp0Hqc.js` 2,939B raw 在位）。
- **口径约定**：「实测」= 材料中真实执行的命令 / 浏览器操作（注明命令与出处材料）；「官方数据」= 官方 blog / 仓库文档数字（注明 URL）；「推断」= 基于实测数据的推理（明确标出）；**unconfirmed** = 材料声称、但审读与本报告均未能验证的说法。除标注「本报告复核 / v2 新增」外，性能/计时数字为材料记录、本报告未重跑；审读按确定性原则选择性复跑了体积支点数字（计时属噪声敏感测量，审读亦未复跑）。

---

## 1. 结论速览

| 维度 | 现状：shiki 3.23.0（Worker 内按语言懒加载） | 候选：@pierre/highlights 0.2.0（方案 A：仅换 Worker 内核） |
|---|---|---|
| **功能** | vitesse-light/dark 双主题；span 内联 light 色 + `--shiki-dark` 变量；未知语言纯文本回退 | 双主题机制同构：`cssVariablePrefix:'--shiki-'` 实测根元素 style 与 shiki 逐字符一致（材料四）；另备 StreamTokenizer（流式）/ LiveTokenizer（增量编辑）API（材料一，现状用不到） |
| **语言覆盖** | 17 语言 + 21 个手写别名（`markdown-highlight.worker.ts:24-68`，本报告复核）；**diff 不支持**（纯文本）；cts/shellscript/htm/jsonc/大写别名实测不识别（材料四） | **80 语言 + plain** 全编译进单个 WASM，import 即全量可用；211 个内置别名、大小写不敏感；**diff 内置**（红绿行需 ~6 行主题补丁）；博客 17 种必需语言逐一实测全支持（材料一/三） |
| **体积（客户端，仅首次访问；两方案 chunk 均为 content-hash 长缓存资产，回访成本趋近零，§2.5.2）** | 首次高亮拉取 = 基础链 60,609B gz（core+engine+双主题 4 文件，**不含** worker 主块 842B）+ 当页语言块 0.8~46.1kB gz（cpp 最大 46,120B；46.1 为十进制）；全 17 语言累计 **242.97KB gz**、4~N 个请求（材料三，`corepack pnpm --filter @blog/web build` + gzip -9） | 单 chunk **117,061B gz（114.32KB）**（含 JS glue + base64 WASM + 双主题 + 全部 80 语言）+ worker 壳（现状 842B gz 量级）、1 个请求（材料三 vite 构建；审读复跑精确复现，§2.2）；**典型 1-2 语言页首次高亮净增 +9.3~40KB gz**（本地 D1 76 篇取样：每篇 ≤2 种语言，§2.5.1）；-53% 仅 17 语言全开页成立（样本 0/76 篇，理论上限） |
| **冷启动与吞吐**（Apple Silicon 本机 Node 24.14.1 / 桌面 Chromium 同机同口径；**低端移动设备未测**，§5.2-6） | import→ready 27.69ms；首次 codeToHtml 109.82ms；warm 30 行 TS 9.65ms；500 行块 90.33ms（浏览器生产 Worker 974.4ms）（材料三/四） | import→ready 9.16ms（含同步 WASM 编译）；首块 1.94ms；warm 30 行 0.020ms；500 行 0.177ms（浏览器 1.20ms）——首块 56.6×、warm ~482×（倍数为本机口径，外推到真实用户无支撑） |
| **集成成本** | —（现状） | 方案 A 只重写 `markdown-highlight.worker.ts` 一个产品代码文件（编码 0.5-1 小时；连同 e2e、逐页回归与文档同步按半天计，见 §3.1/§6）；`markdown-highlight.ts` / `markdown-view.tsx` / `styles.css` **零改动**；e2e 断言形态实测兼容（材料四） |
| **维护面** | shiki 成熟生态；但自维护 17 项懒加载映射（19 行）+ 21 项别名表（23 行）+ highlighter 单例（worker.ts:5-68，行数本报告 v2 复核） | 自维护映射表全部可删，换成 `isSupportedLanguage()` 一个调用；库本身活跃 beta：npm 共 10 版、0.2.0 发布于 2026-10-21（审读查 registry 复核）、周下载 ~6.1 万（材料一 61,396；审读 api.npmjs.org 2026-10-16~22 窗口 61,780，同量级）；「41 贡献者」「lexer 修复 1-2 天合入」及「6 周」时间窗 **unconfirmed**（材料一称 GitHub API 实查，审读未能验证）；license **Apache-2.0**（材料一 + 审读 npm registry 复核） |
| **风险** | shiki SSR 历史上打爆免费 CPU（1102/503，`markdown.tsx:45-49` 注释，本报告复核）；现状客户端方案已稳定 | 官方明示 beta、API 可能变；未知语言裸调抛 RangeError（需守卫）；返回值是 WASM 内存视图（需 decode）；未来加 CSP 需 `'wasm-unsafe-eval'`（**仓库内**未配置 CSP——仓内搜索无法覆盖 Cloudflare 控制台层 header 规则）；真实 CF 生产部署仅本地 workerd 验证；Firefox 与低端移动设备未测（材料一，§5.2-6） |

**一句话结论（实测支撑；倍数均为 Apple Silicon 本机口径，v2 修订）**：方案 A 在数据上成立——产品代码改动一个文件，换来 diff 高亮、别名净增、首块 56.6× / warm ~482× 的引擎提速；体积上典型页面（本地 D1 76 篇取样，每篇 ≤2 种语言）**首次高亮净增 +9.3~40KB gz**，17 语言全开页才 -53%（样本 0/76 篇，理论上限），且差异仅首次访问（长缓存）。速度已足以让高亮回到 SSR 是本机量化结论（稳态 0.34ms vs 10ms CPU 限；CF 生产 isolate 未复测，§5.4），但建议不回（见 §5.4）。主要代价：首次访问体积净增、低端设备冷启动未测、beta 依赖风险。

---

## 2. 体积与冷启动实测

### 2.1 客户端体积——现状基线（材料三实测：`corepack pnpm --filter @blog/web build`，vite 7/rollup；懒 chunk gzip 为 `gzip -9 -c <file> | wc -c` 逐文件实测）

| chunk | raw (B) | gzip (B) |
|---|---:|---:|
| worker 主块 `markdown-highlight.worker-DZY4mkNq.js` | 1,623 | 842 |
| shiki/core（懒） | 106,010 | 33,964 |
| shiki/engine/javascript（懒） | 58,835 | 20,484 |
| vitesse-light（懒） | 13,614 | 3,068 |
| vitesse-dark（懒） | 13,757 | 3,093 |
| **基础链小计（4 个懒文件；不含 worker 主块 842B）** | — | **60,609** |
| json | — | 795 |
| yaml | — | 2,266 |
| rust | — | 2,704 |
| sql | — | 7,429 |
| java | — | 4,247 |
| bash | — | 6,034 |
| go | — | 5,056 |
| css | — | 11,842 |
| html | — | 11,706 |
| markdown | — | 5,594 |
| python | — | 9,043 |
| c | — | 10,373 |
| javascript | — | 16,126 |
| tsx | — | 16,119 |
| jsx | — | 16,215 |
| typescript | — | 15,688 |
| cpp（raw 637.6KB） | — | 46,120 |
| **17 语言懒块合计** | — | **187,357** |
| **shiki 客户端产物合计** | — | **248,808 ≈ 242.97KB** |

主 bundle `index-CKjFUGnL.js`（不含懒链）472.86KB raw / 153.16KB gz，grep 验证 shiki 零命中——**shiki 完全不在主 bundle**（材料三，构建输出）。页面首次高亮总拉取 = 基础链 60,609B + worker 主块 842B + 当页语言块（§2.5 表采用此边界）。

### 2.2 候选体积（材料三实测：scratch 工程 `/tmp/blog-highlights-spike-size`，vite 8/rolldown，`@pierre/highlights@0.2.0`）

| 项 | raw (B) | gzip (B) |
|---|---:|---:|
| 动态 import 单 chunk（JS glue + base64 WASM + 双主题 + 全 80 语言） | 270,109 | **117,061（114.32KB）** |
| 静态 import 净占（扣除同构建 react-dom 基线 68,277B gz） | — | ≈115.9KB（与懒 chunk 一致） |
| highlights.wasm | 183,180 | 85,058（npm meta 自报 84,987，差 71B / 0.08%，疑为 gzip 等级差异，未归因——v2 注明） |
| base64 层 highlights.wasm.mjs（仅浏览器路径） | 244,373 | 107,538（比裸 WASM 多付 22.5KB gz；workerd 路径无此层） |
| 包内 JS glue 全链（未摇树口径，8 文件） | — | 21,715（vite 摇树后净占 ≈7.0KB） |
| vitesse-light / vitesse-dark（单主题子路径） | — | 1,250 / 1,255 |
| 全量 themes.js（**勿整包引入**） | 330,524 | 38,239 |

**口径互证**（材料三）：同一 vite8 构建内复刻仓库 shiki 懒链 = 249,255B gz，与仓库真实构建 248,808B 差 0.2%——两种口径互证成立。
**审读复跑（2026-10-24，确定性复现）**：`cd /tmp/blog-highlights-spike-size && rm -rf dist && ./node_modules/.bin/vite build` → 产物 hash 与原构建一致（`lazy-highlights-C8lXOoGq.js`）；`gzip -9 -c dist/assets/lazy-highlights-*.js | wc -c` = **117,061**、`ls` = **270,109 bytes**，与材料三分毫不差。同构建内另复现：react-dom 基线 `main-DGUL4clF.js` gz = **68,277 ✓**；shiki 懒链逐 chunk 求和 = **249,255 ✓**（若计入 3 个 146-153B re-export stub 则 249,728，差 0.2%，不影响结论）。
**glue 净占的两个口径（v2 说明）**：本表浏览器路径 ≈7.0KB（117,061 − base64 层 107,538 − 双主题 2,505 = 7,018B，vite 摇树后残差）与 §2.3 服务端 ~11.5KiB（96.75 − 0.14 − wasm 85.06）相差 ~4.5KB——前者是 vite 对浏览器入口摇树（live/tokens 等大部分被摇掉）后的净残差，后者是 wrangler 对 workerd 入口（`dist/workerd.js` 原生 import .wasm）打包的净增量，打包器与摇树程度不同；差异未逐一归因，均如实记为各自实测。
**与材料一 129,418B 的差异说明**：材料一为包内 dist 文件未摇树直加（glue 21.8 + base64 WASM 107.6 + 双主题 ≈2.5 ≈ 129.4KB gz）；材料三 117,061B 为 vite 摇树后实际交付的 chunk。两者各自成立，本文以材料三（实际会上线的产品口径）为准。

### 2.3 服务端影响（材料三实测：`wrangler deploy --dry-run`）

| 项 | 数值 |
|---|---|
| 现状 server bundle | Total Upload 6,209.02 KiB / **gzip 1,104.77 KiB**（3 MiB = 3,072 KiB 红线的 36%） |
| highlights 若进 SSR（方案 B） | 最小 worker + 全链 96.75 KiB gz，空 worker 对照 0.14 KiB → 净增 **+96.61 KiB gz**（wasm 85.06 + 打包后 glue ~11.5；与浏览器路径摇树后 ≈7.0KB 的差异见 §2.2 口径说明） |
| 方案 B 后总量 | 1,104.77 + 96.61 ≈ 1,201.4 KiB = 红线 **39%**，余量约 1,870 KiB |
| **方案 A（维持客户端 Worker）** | **服务端 0 影响** |

### 2.4 冷启动与吞吐（材料三实测：Node 24.14.1，5 次独立进程中位；warm 为 3 进程 × 200 次迭代中位；shiki 3.23.0 = 仓库锁定版本，复刻 worker 加载模型）

| 指标 | shiki 3.23.0 | highlights 0.2.0 | 倍数 |
|---|---:|---:|---:|
| import → ready | 27.69ms（25.6~30.4） | 9.16ms（8.5~9.4，含同步 `new WebAssembly.Module`） | 3.0× |
| 首次 codeToHtml | 109.82ms（108.7~111.1） | 1.94ms（1.75~1.99） | 56.6× |
| warm 30 行 TS 双主题（200 次中位） | 9.65ms | 0.020ms | ~482× |

材料一独立复测同数量级（冷启动 7.2ms / 首调 1.0ms，Node 24）。

**口径注（v2，审读 #12）**：「import → ready」两列语义不对称——shiki 的 27.69ms 仅含加载 **typescript 一种语法**（scratch `bench-shiki.mjs:20`，审读复核），highlights 的 9.16ms 含**全部 80 语言**。此不对称实际对 shiki 有利、对结论无害，但读者不应将两列当作同语义对比。

分块计时（材料四实测：Node 24.14，warm 中位，同口径；429×/510× 为材料四原文，其余倍数由实测值相除换算）：

| 代码块 | shiki | highlights | 倍数 |
|---|---:|---:|---:|
| 46 行 ts | 7.83ms | 0.018ms | 429× |
| 44 行 tsx | 12.76ms | 0.018ms | ~709× |
| 36 行 bash | 2.49ms | 0.014ms | ~178× |
| 36 行 sql | 1.42ms | 0.013ms | ~109× |
| 500 行大块 | 90.33ms | 0.177ms（吞吐 ~100MB/s vs ~0.2MB/s） | 510× |
| 500 行 · 浏览器生产 Worker（vite build + preview） | 974.4ms | 1.20ms | ~812× |
| 初始化 | core+engine+2 主题 37.6ms + 5 语言 10.0ms | import 含 WASM 编译 8.19ms（**全 80 语言**） | — |

### 2.5 首次高亮增量、盈亏平衡与真实页面分布

**单位与边界口径（v2 重写，修正审读 #5 的混用）**：材料三原文的端点 62.2/117.1 为**十进制 kB**（62,246B / 117,061B），其差值「+53.5KB」则是同一差值 54,815B 的**二进制**换算（54,815/1,024=53.5）——同句端点表观差不一致即由此而来；全篇其余 KB（60,609B=59.19KB、114.32KB、242.97KB 等）均为二进制。下表统一以字节列出。「基线」= 基础链 60,609B + worker 主块 842B + 当页语言块（§2.1 表）；「候选」= lazy chunk 117,061B + **候选 worker 壳**（未单独构建；现状壳 842B gz / scratch 复刻 wrapper `shiki-lazy-DKhp0Hqc.js` 2,939B raw 为参照，估 ~1KB gz 量级，推断）——即材料三的差值未计候选壳，对候选略有 ~1KB 级低估。

| 页面语言构成 | 现状首次拉取（B gz） | 候选首次拉取（B gz） | 差值（材料三口径，未计候选壳） |
|---|---:|---:|---:|
| 纯 json | 62,246 | 117,061（+壳 ~1KB） | +53.5KB |
| 纯 typescript | 77,139 | 117,061（+壳） | +39.0KB |
| 纯 cpp | 107,571 | 117,061（+壳） | +9.3KB |
| cpp + typescript | 123,259 | 117,061（+壳） | -6.1KB（候选反超） |
| 全 17 语言 | 248,808 | 117,061（+壳） | **-128.65KB（-53%）** |

- 语言块累计超 **54.3KB gz** 后候选反超（材料三）；主 bundle（153.16KB gz）与首屏关键路径 **0 变化**——两方案都是 worker 线程渐进增强。
- 若误用静态 import 进主 bundle（非方案 A）：主 bundle +~114KB gz（153→267KB）——不推荐。

#### 2.5.1 典型页面语言分布取样（v2 新增，本地 D1 只读查询）

审读意见指出「-53%」缺真实页面分布支撑（审读 #3）。本次修订以 sqlite3 只读模式（URI `mode=ro`）查询本地 D1（`apps/web/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/747be672….sqlite`，本地 dev 状态，库文件 mtime 2026-09-26）：

- `SELECT count(*) FROM post` → **76 篇**，全部 public/published；
- 以正则 `^```lang$` 扫描 `post.body`：共 **102 个带语言围栏的代码块**；语言直方图 **cpp 81 / typescript 17 / js 2 / html 1 / javascript 1**；
- 每篇去重语言数：**1 种 68 篇、2 种 2 篇、0 代码块 6 篇——没有任何 ≥3 种语言的页面**；
- 佐证：仓库 e2e 自己的测试页同为轻量（`tests/e2e/markdown-performance.spec.ts:18` 断言 count 3 个代码块、`:51` 断言 count 2 个 js 块，本报告 v2 复读）。

**推论（基于上述取样）**：-53% 的前提（17 语言全开页）在本地样本中占 **0/76 篇**，属理论上限而非博客现实；真实页面首次高亮差异是**净增 +9.3~40KB gz**——其中 cpp 主导页最小（+9.3KB），而 cpp 恰是样本 81/102 块的绝对主力、同时也是 shiki 最贵语言（46,120B gz），ts/js 页则净增 ~39KB。**局限（如实声明）**：① 远端生产 D1 未取样（本会话尝试 `wrangler d1 execute blog --remote` 只读 count，因非交互环境无 `CLOUDFLARE_API_TOKEN` 失败）；② 本地库为 2026-09-26 快照，生产若有新增多语言长文不在样本内；③ 样本含 6 篇无代码块文章，与高亮无关。

#### 2.5.2 缓存与回访口径（v2 新增，审读 #7）

两方案的 chunk 均为 content-hash 长缓存资产（scratch 产物 `lazy-highlights-C8lXOoGq.js` 实见哈希文件名、审读复跑同 hash；仓库产物同理，如 `markdown-highlight.worker-DZY4mkNq.js`）。因此 §2.5 表的体积差异**只发生在首次访问或缓存失效后**，回访者两方案成本均趋近于零；「4~N 请求 → 1 请求」在 Cloudflare HTTP/2 连接复用下的实际时延收益**未评估（unconfirmed）**。

### 2.6 官方 benchmark 与第三方复现（官方数据，材料一核对）

- 官方 blog（Bun 1.4.0 / Apple M4 Pro，2026-10-05）：HTML 生成 297-928 MiB/s vs Shiki 4.4.1（默认 JS regex engine，即较快档）0.59-5.89 MiB/s，130-638×（298× @ 517KiB TS）；内存 517KiB→HTML：50 MiB vs 155（JS）/ 349（Wasm）；5MiB：104 vs 739/963；浏览器 5.56M 字符 JS：81.6ms vs gpu-lexer 400.8 vs shiki 28.28s。出处：https://pierre.computer/writing/on-highlighting-code 、https://raw.githubusercontent.com/pierrecomputer/pierre/main/packages/highlights/benchmark/README.md （bench.ts:177-189 确认 shiki 用 JS engine 且禁用提前退出，对 shiki 保守公平）。
- 第三方独立复现：wwwtom PR#234（99KB TS：shiki 1091ms → highlights <1ms）https://github.com/et0and/wwwtom/pull/234 ；材料一作者本机 Node 复测 500KiB 双主题 97 MiB/s（同数量级）。
- 注意：官方表 shiki 为 4.4.1；本报告 §2.4 的本地配对实测用仓库锁定 3.23.0——两版本结论同数量级。

---

## 3. 渲染与集成验证

### 3.1 四个方案（材料四 + 材料一）

| 方案 | 内容 | 改动量 | 评估 |
|---|---|---|---|
| **A · 仅换 Worker 内核** | 保留「SSR 纯代码块 + Worker 渐进增强 + IntersectionObserver」架构与 `{id,code,lang}→{id,html}` 协议，只重写 `markdown-highlight.worker.ts`：删 shiki/core + JS engine + LANG_IMPORTS（:24-42）+ LANG_ALIASES（:46-68）+ getHighlighter（:5-21），换 `codeToHtml` / `isSupportedLanguage` + 单主题子路径 | **产品代码 1 个文件（另 `docs/architecture.md:33,110` 文档同步）；编码 0.5-1 小时**。v2 修正：连同 §6 六条护栏落地、e2e 实跑、AGENTS.md §9 浏览器逐页回归与文档更新，整体按半天计更稳妥 | 推荐基准 |
| B · 高亮搬回 SSR | workerd 条件入口原生 import .wasm（package.json exports 确认）；SSR CPU 稳态 0.34ms | 半天-1 天 | 数据可行、非必要（见 §5.4），不推荐 |
| C · 去 Worker 主线程 | 官方文档明说不开 worker pool 通常更好；单块主线程 0.018-1.2ms | 1-2 小时 | 纯删代码；保留 Worker 无害，维持 A |
| D · 现状 + diff 补丁 | 给 shiki worker 加 diff.mjs + 补别名 | 10 分钟 | 不引入新依赖的对照基线；不解决性能/体积/别名缺口 |

### 3.2 方案 A 的关键实现约束（材料四，全部实测确认）

1. **WASM 内存视图**：`codeToHtml` 返回的 Uint8Array 会被下次调用覆盖（README:32-35 + 实验复现：连续两次调用后旧视图内容已变）→ worker 内必须 `new TextDecoder().decode()` 后再 postMessage（与现有返回 string 的协议天然契合）。
2. **主题前缀**：`cssVariablePrefix: '--shiki-'` 实测原样输出 `--shiki-dark:#dbd7caee`、`--shiki-dark-bg:#121212`；根元素 style 与 shiki 逐字符一致：`background-color:#ffffff;--shiki-dark-bg:#121212;color:#393a34;--shiki-dark:#dbd7caee`。
3. **class 并存**：`upgradeCodeBlock`（markdown-view.tsx:77-79，本报告复核）把返回 pre 的 classList **追加**到 SSR pre 上——`shiki` + `highlights` 类并存，`html.dark .shiki span`（styles.css:257-262）等现有 CSS 一行不改全部继续命中。
4. **Worker 构建形式**：必须字面量 `new Worker(new URL('./x.worker.ts', import.meta.url))`——变量形式会被 Vite 静默打成运行时 404 的 URL（材料四实验中踩到并修正；博客现状 markdown-highlight.ts:12-15 恰为字面量形式）。
5. **主题传对象**：不能像 shiki 传字符串 ID；单主题子路径引入，勿整包引 themes.js（330KB raw）。

### 3.3 样张页

**[docs/reports/assets/2026-10-24-highlights-samples.html](assets/2026-10-24-highlights-samples.html)**（相对本报告；工作区全路径 `docs/reports/assets/2026-10-24-highlights-samples.html`）。内容（材料四）：A（shiki + diff grammar）/ B（highlights 原样）/ B''（highlights + diff 红绿补丁）三形态并排；9/9 代码块经与生产同款的逐块 drain 管线按需增强（dev 与 vite build 生产模式各一轮真实浏览器验证）；支持 html.dark 切换对比。本报告复核：文件存在，576,022 字节。

### 3.4 e2e 兼容性（材料四实测输出形态 + 材料二断言清单）

| e2e 断言（tests/e2e/markdown-performance.spec.ts） | 兼容性 |
|---|---|
| `span[style*="color"]`（:7/25-26/54） | 直接满足——highlights 输出内联 color（实测 46 行块 291 个带色 span、500 行块 3,145 个） |
| `data-highlighted`（:21/34） | 协议不变，保留 |
| worker 数恒为 1（:43/59-60） | 单 worker 复用架构不变，保留 |
| 别名 js/ts/sh/shell/c++（:98-118） | 五个全部内置（isSupportedLanguage 实测） |
| `.line` 行包装 | highlights 无 `<span class=line>`（span 少 8-20%）；博客 CSS 无 `.line` 依赖（grep styles.css 零命中） |
| 颜色值 | **抽样一致、非逐字全同（v2 修正，与 §5.2-3 统一口径）**：实测 vitesse 主题下同段代码首 span light/dark 颜色两引擎一致（rgb(30,117,79)/rgb(77,147,117)），抽样值与 shiki 相同仅大小写不同（#1e754f vs #1E754F，等值）；但 token 分类存在差异，**个别 token 颜色与 shiki 非逐字相同**（官方自认）。e2e 断言的是 `style*="color"` 形态而非具体色值，不受影响 |

**e2e spec 本身未运行**（材料二明示需 playwright webServer + 本地 D1 种子 + admin 注册流程；本报告撰写时亦未运行）——上述兼容结论来自材料四对输出形态与别名行为的实测，非 e2e 实跑。上线前应实跑该 spec。

---

## 4. 逐项核对表

| # | 项 | 结论 | 证据（实测） | 未验证 / 备注 |
|---|---|---|---|---|
| 1 | **暗色模式** | ✅ 可行且零 CSS 改动 | 单 HTML 双主题与现状同构：span 内联 light 色 + `--shiki-dark` 变量（cssVariablePrefix 实测原样输出）；真实浏览器切换 html.dark 后 A/B 两列首 span computed color 完全一致（rgb(77,147,117)=#4d9375）、pre 背景同 #0a1016（材料四）；styles.css:257-262 / 413-416 规则本报告复核在位 | 备选机制 `defaultColor:false` 与 `'light-dark()'` 均实测可用；首帧暗色依赖 `__root.tsx:25` THEME_BOOT_SCRIPT，不受影响（材料二） |
| 2 | **复制按钮** | ✅ 无影响 | `pre.textContent` 在两种引擎输出下与源码逐字节一致（1346 / 17724 字符全等）；对照页点击复制 fallback 正确报出 1346 字符；upgradeCodeBlock 只换 `code.innerHTML`（材料四） | span 内含换行文本节点，白空间渲染与换行还原与 shiki 等价（材料四） |
| 3 | **懒加载 / IntersectionObserver 队列** | ✅ 零改动兼容 | 真实浏览器用同款逐块 drain 管线验证 9/9 块按需增强（dev + vite build 生产模式各一轮）；消息协议 `{id,code,lang}→{id,html}` 不变；rootMargin 400px、串行队列、abort 丢弃过期响应、单 worker 复用全部保留（材料四；架构见材料二 markdown-view.tsx:27-61） | 生产 worker chunk 经 Vite 字面量 Worker 构建正常产出（注意 §3.2-4 的字面量陷阱） |
| 4 | **未知语言降级** | ⚠️ 需守卫 + 一次语义选择 | 裸调 `codeToHtml` 抛 `RangeError: unknown lang: notalang`（实测；shiki 对应抛 ShikiError）；`isSupportedLanguage()` 守卫 + `'text'` 兜底输出无 span 纯文本、textContent 与源码一致（材料四） | 语义选择：兜底路径会设 `data-highlighted=true`（内容其实没变）vs 现状「未知→纯文本不增强、不设标记」；改守卫失败直接返回 null 可完全贴合现状——两种都实验通过（材料四） |
| 5 | **别名** | ✅ 覆盖净增，手写表可删 | `isSupportedLanguage()` Node 24 实测：17 必需语言全 true；33 个探针别名（js/mjs/cjs/ts/mts/cts/tsx/jsx/py/sh/shell/shellscript/shellsession/zsh/rs/yml/md/c++/cc/cxx/hpp/hh/hxx/h/golang/htm/jsonc/TS/Bash/Diff/diff/git-commit/patch）全部内置且大小写不敏感；对照复刻现状 resolveLangKey 实测**不识别** cts/shellscript/htm/jsonc/大写/diff 系列（材料四；211 别名来自 languages.d.ts，材料一/三核对） | `LANG_ALIASES` 21 项手写映射（worker.ts:46-68，本报告复核）可整体删除；无语言自动检测 |
| 6 | **Worker 可运行性** | ✅ 三运行时实测跑通 | ① 浏览器模块 Worker（Chromium，`new Worker(url,{type:'module'})`）：import 时同步 `new WebAssembly.Module()` 成功，首条消息全链 47.2ms、第二条 18KB Python 14.6ms；② Node 24.14.1：7.2ms / 首调 1.0ms；③ workerd：wrangler 4.137.0 本地 dev 真实 workerd 运行时跑通（workerd 条件 → dist/workerd.js 原生 import .wasm，绕过 base64 层），生产 compat date 2026-06-01 无障碍；④ SSR 零 DOM 依赖（Node 无 DOM 跑通即证）（材料一） | **未实测（v2 扩充）**：真实 Cloudflare 生产部署（仅本地 workerd）；CF 生产 isolate 的 CPU 计费口径（§5.4 相关）；Safari/WebKit（官方博客称已为 JSC SIMD 做 workaround，未亲测）；**Firefox/Gecko 完全未测**（公开博客的现实流量组成，审读 #4 补列）；**低端移动设备未测**——import 时同步 `new WebAssembly.Module()`，冷启动可能远高于本机 9.16ms（scratch `bench-highlights.mjs:16-17` 注释自认同步编译，审读 #2） |

---

## 5. 收益与代价清单

### 5.1 收益（每条有实测支撑）

1. **diff 代码块高亮**：现状无 diff grammar → 纯文本；highlights 内置 diff lexer（languages.d.ts:47-50，别名 git-commit/git-rebase/patch），token 级高亮开箱；vitesse 主题 diff.plus/minus 默认为前景色，需 **~6 行主题补丁**（`'diff.plus':{color:'#22863a'},'diff.minus':{color:'#b31d28'}`，dark 同理）即得与 shiki+vitesse 一致的红绿行，实测生效（材料四）。
2. **别名覆盖净增**：cts/shellscript/htm/jsonc/大小写/diff 系列现状实测不识别 → 全部内置；17 必需语言全覆盖（材料四）。
3. **体积（v2 修正框架）**：全 17 语言重度页 242.97 → 114.32KB gz（**-53%**）——该场景在本地 D1 样本中 **0/76 篇**（§2.5.1），属理论上限；**博客典型 1-2 语言页首次高亮为净增 +9.3~40KB gz**（cpp 主导页最小）；请求数 4~N → 1 仅对首次访问有意义（content-hash 长缓存，§2.5.2）。
4. **性能（Apple Silicon 本机口径；低端移动设备未测）**：首块 56.6×、warm ~482×、500 行块浏览器生产 Worker 974.4 → 1.20ms（材料三/四）。
5. **删自维护代码**：19 行 LANG_IMPORTS 懒加载映射 + 23 行 LANG_ALIASES 手写别名表 + getHighlighter 单例（worker.ts:5-68，v2 复核行数）→ 库内置 `isSupportedLanguage()` 一个调用（材料一/二）。
6. **解锁 SSR 可能性**（数据见 §5.4）与未来进阶 API（StreamTokenizer 流式 / LiveTokenizer 增量编辑，单行编辑 0.5-1.2µs——现状整块高亮用不到，备选；材料一）。
7. **e2e 断言零改动兼容**：`span[style*="color"]` / `data-highlighted` / worker=1 / 五别名断言全部实测满足（材料四，§3.4）。

### 5.2 代价与风险

1. **典型页面首次高亮净增 +9.3~40KB gz（v2 改写）**：本地 D1 76 篇取样显示每篇 ≤2 种语言（§2.5.1）——净增是博客现实页面的常态而非例外（cpp 主导页 +9.3 / ts 页 +39.0 / json 页 +53.5KiB，材料三口径、未计候选 ~1KB worker 壳）；语言块累计 >54.3KB gz 候选才反超，样本中仅 2/76 篇（2 种语言）接近该区间。缓解因素：渐进增强、不进首屏关键路径；差异仅首次访问（长缓存，§2.5.2）。
2. **beta 库进生产**：官方文档明示 "Highlights is in beta, and its API may still change"（https://diffs.com/highlights ）；0.2.0、6 周 10 版。缓解：锁精确版本（先例：wwwtom PR pin 0.2.0），升级走显式 changelog 检查（材料一）。
3. **token 分类与 shiki 有差异**（官方自认，如变量常量着色不同）：属保真度差异非性能差异；实测 vitesse 主题抽样颜色一致，但个别 token 颜色非逐字相同，视觉回归时留意（材料一/四）。
4. **已知实现陷阱（有解）**：WASM 内存视图须 decode；未知语言 RangeError 须守卫；主题须传对象；**未来若加 CSP 需 `'wasm-unsafe-eval'`**（同步 `WebAssembly.Module` 触发；**仓库内**未配置 CSP——材料一全仓搜索 + 审读复核 `apps/web/src` 与 `wrangler.jsonc` 零命中；Cloudflare 控制台层 header 规则不在仓库内，仓内搜索无法排除——是未来约束，非当下阻塞）。
5. **浏览器路径 base64 多付 22.5KB gz**（workerd 路径无此层；材料三）。
6. **验证空白（v2 扩充）**：真实 CF 生产部署未测（仅本地 workerd）；**CF 生产 isolate 的 CPU 计费口径未复测**（§5.4 相关）；Safari/WebKit 未亲测（官方称已为 JSC SIMD 做 workaround）；**Firefox/Gecko 完全未测**；**低端移动设备未测**（同步 `WebAssembly.Module()` 编译，冷启动可能远高于本机 9.16ms）；「4~N→1」请求合并在 HTTP/2 下的实际收益未评估；e2e spec 未实跑（§3.4）。
7. **误用静态 import 的风险**：主 bundle +~114KB gz——方案 A 明确走 worker/动态 import 规避（材料三）。
8. **依赖许可（v2 补记，审读 #8）**：Apache-2.0（材料一 + 审读查 npm registry 复核）——无阻塞；v1 遗漏此项常规核对，补记。

### 5.3 与 AGENTS.md 约束 #6 的对照

AGENTS.md §2.6（原文）：「优先使用平台和依赖库的原生能力……迁移应减少自维护代码；不为格式偏好或非必要功能重建一层封装。原生能力不足时，先说明业务必要性和维护成本，再决定是否增加脚本。」

- **方向一致**：方案 A 是「删自维护封装、换库原生能力」——**19 行** LANG_IMPORTS 懒加载映射（:24-42，v2 复核 `wc -l`，v1 误写 38 行）、23 行 LANG_ALIASES 手写别名表（:46-68）、getHighlighter 单例管理（worker.ts:5-21）替换为库内置 `isSupportedLanguage()`（211 别名、大小写不敏感）。**不是重建一层封装**。
- **业务必要性有实测支撑（非格式偏好）**：① diff 高亮——现状缺失的读者可见功能；② 别名缺口——现状实测不识别 cts/shellscript/htm/jsonc 等；③ 长文性能——500 行块 90-974ms → 1.2ms。三条均落在 #6 要求的「先说明业务必要性」框架内。
- **反向权衡**：#6 的精神也包含维护成本审慎——引入 beta 库本身是新维护成本（§5.2-2）。判定：符合 #6，前提是接受 beta 依赖并锁版本。

### 5.4 「速度是否足以让高亮回到 SSR」的数据结论

- **当年原因的量化复现**（材料四实测，Node，20 块 20.5KB 长文模拟）：shiki cold 189ms / **warm 102ms** —— 超 Cloudflare 免费版 10ms CPU/请求约 10 倍；与 `markdown.tsx:45-49` 注释记载的历史 1102/503（本报告复核注释在位）吻合。
- **highlights**：import + 全部 20 块 8.53ms（其中 import 8.19ms 为一次性，isolate 常驻摊薄后）**稳态全文高亮仅 0.34ms**——10ms 限内余量 25×+；server bundle 余量同样充足（红线 39%，§2.3）。
- **结论（本机实测 + 推断；v2 降级标签，审读 #6）**：「性能障碍已消失」是**本机 Node** 的量化复现；CF 生产 isolate 的 CPU 计费口径未复测（§4-6 / §5.2-6），故「SSR 化（方案 B）可行」应视为**本机推断**而非生产实测结论。原文「余量 25×+」为材料四数字（偏保守）；按 10ms/0.34ms 复算 ≈29×，审读复算一致。
- **建议（推断）**：不回 SSR——方案 A 下客户端高亮已无感（首块 e2e 数十 ms 内、后续 <2ms），SSR 化的边际收益只剩「无 JS 首屏即见高亮」，不足以抵消首屏 HTML +150-200KB、页面缓存体积同涨、SSR 失败模式重新耦合进页面渲染（材料四推断，标注为推断）。

---

## 6. 建议

**倾向：go（方案 A，仅换 Worker 内核），附条件。**

理由（全部有实测支撑；v2 修订表述）：
1. §4 六项核对：暗色 / 复制 / 懒加载 / 别名 / 三运行时可运行性五项实测通过，未知语言降级一项需守卫 + 语义选择（两种实现均实验通过）；样张页可肉眼对比（§3.3）。
2. 体积（预期修正后仍可接受）：典型页首次高亮净增 +9.3~40KB gz（不进关键路径、仅首次访问，§2.5/§2.5.1）；17 语言全开页 -53% 为理论上限（样本 0/76 篇）；请求数 4~N→1（首次访问）。
3. 性能全维度 1-3 个数量级提升（§2.4；**Apple Silicon 本机口径**，低端移动设备未测），长文多块页面的 worker 往返延迟显著下降。
4. 符合 AGENTS.md #6：净删自维护代码（19+23 行映射 + 单例管理），业务必要性三条均有实测（§5.3）。
5. 产品代码改动 1 个文件（另 `docs/architecture.md:33,110` 文档同步）、完全可逆（revert 即回 shiki）。

**条件 / 护栏**：
- 依赖锁精确版本 `0.2.0`（beta API 可能变）；
- `isSupportedLanguage()` 守卫未知语言，建议守卫失败返回 null 以保持现状「未知→不增强、不设 data-highlighted」语义（§4-4）；
- worker 内 `TextDecoder().decode()` 后再 postMessage（§3.2-1）；
- 保持字面量 `new Worker(new URL(...))` 形式（§3.2-4）；
- diff 红绿行需 ~6 行主题补丁，无补丁则仅 token 高亮无红绿（§5.1-1）；
- 后续若为站点引入 CSP，需为 Worker 内 WASM 同步编译加 `'wasm-unsafe-eval'`（§5.2-4，仓库内现无 CSP）；
- 合并前实跑 `tests/e2e/markdown-performance.spec.ts`（本报告与材料均未跑）并做浏览器逐页回归（AGENTS.md §9 硬约定）；
- 同步更新 `docs/architecture.md:33,110`（材料二）。

**不建议**：方案 B（SSR 化——数据可行但收益不抵代价，§5.4）；方案 C（去 Worker——纯删代码，非必要）。
**若 beta 风险不可接受**：方案 D（shiki + diff grammar 补丁，10 分钟）为最小替代，但性能、体积、别名缺口均不解决。

**附带发现（材料二，与本次替换独立）**：`@shikijs/rehype`（^3.1.0，lockfile 实装 3.23.0）全仓 grep 确证未被任何源码 import，可独立从 dependencies 移除。

> 最终判定（go / partial / no-go）由评审官另做；本报告仅提供数据与倾向。

---

### 附：来源索引

- 材料一（库调研）：官方 blog https://pierre.computer/writing/on-highlighting-code ；文档 https://diffs.com/highlights ；npm https://www.npmjs.com/package/@pierre/highlights ；仓库 https://github.com/pierrecomputer/pierre （benchmark/ 与 apps/docs 原文、commits/issues API 实查）；0.2.0 tarball 本地实测（languages.d.ts / themes / dist 各入口）；Node 24 / Chromium 模块 Worker / wrangler 4.137.0 workerd 实测。
- 材料二（仓库地图）：`apps/web/src/components/markdown*.ts(x)`、`apps/web/src/styles.css`、`apps/web/tests/markdown-highlight.test.ts`（已跑，4 passed）、`apps/web/tests/markdown-access.test.ts`（已跑，4 passed）、`tests/e2e/markdown-performance.spec.ts`（未跑）、`docs/architecture.md:33,110`。
- 材料三（体积实测）：`corepack pnpm --filter @blog/web build` + gzip -9 逐 chunk；`wrangler deploy --dry-run`（两端）；scratch 工程 `/tmp/blog-highlights-spike-size`（vite 8，bench-highlights.mjs / bench-shiki.mjs，产物与脚本留存可复跑）。
- 材料四（渲染验证）：真实浏览器 A/B 对照与样张页 `docs/reports/assets/2026-10-24-highlights-samples.html`；Node 24.14 分块/SSR 模拟计时；Vite 字面量 Worker 生产构建验证。
- 本报告 v1 复核（2026-10-24 会话）：样张页存在性（576,022B）；`markdown-highlight.worker.ts:24-73`、`styles.css:257-262/413-416`、`markdown-view.tsx:63-82`、`markdown.tsx:45-49` 行号抽查。
- 审读意见（2026-10-24，v2 修订依据）：scratch 确定性复跑（`rm -rf dist && ./node_modules/.bin/vite build`，同 hash `C8lXOoGq`，117,061B gz / 270,109B raw / 68,277B / 249,255B 全部精确复现）；行号与事实断言抽查（`markdown-highlight.ts:12-15` 字面量 Worker、e2e spec 8 处行号、shiki 3.23.0 锁定 pnpm-lock.yaml:3484、`@shikijs/rehype` 零引用、仓库内无 CSP、compat date wrangler.jsonc:4、`.line` 零依赖、§2.1/§2.5 算术逐项复算）；npm registry / api.npmjs.org 查询（10 版、0.2.0@2026-10-21、周下载 61,780@2026-10-16~22、Apache-2.0）；unconfirmed 清单（41 贡献者、lexer 修复 1-2 天、6 周窗口）与未复核项声明（计时数字、仓库侧构建值、材料四浏览器验证未在本会话重跑）。
- 本报告 v2 新增（2026-10-24 会话）：行数 `wc -l` 复核（19/23）；本地 D1 只读取样（sqlite3 URI `mode=ro`，命令与结果见 §2.5.1）；远端 D1 取样尝试失败记录（无 `CLOUDFLARE_API_TOKEN`）；e2e spec :18/:51 复读；scratch 产物清单复核（`shiki-lazy-DKhp0Hqc.js` 2,939B raw、`main-DGUL4clF.js` 在位）。

---

## 7. 实施结果（分支 feat/web-highlights-engine）

> 本节为 v3 追加（只追加，正文 §1-§6 与附录未改动）。内容由实施会话记录（任务输入提供）+ 本报告撰写会话的仓库核实共同构成，两者逐项标注。**状态：改动尚未提交**——当前工作区位于 `feat/web-highlights-engine` 分支，HEAD 仍为 master 的 `db37faa`，全部改动以工作区 diff 形式存在（`git status` / `git diff HEAD` 本会话实查；`master..feat/web-highlights-engine` 无 commit）。

### 7.1 改动文件清单（本会话 `git diff HEAD --numstat` 实查）

| 文件 | 增/删 | 内容（diff 本会话复核） |
|---|---|---|
| `apps/web/src/components/markdown-highlight.worker.ts` | +53/−82（102→73 行） | 方案 A 落地：删 shiki/core + JS engine + LANG_IMPORTS（19 行）+ LANG_ALIASES（23 行）+ getHighlighter，换 `@pierre/highlights`；含 `withDiffColors` diff 红绿补丁（新文件 :9-23，注入 `diff.plus`/`diff.minus` 色，行号本会话 diff 复核属实） |
| `apps/web/package.json` | +2/−1 | +`@pierre/highlights: "0.2.0"`（**精确 pin**，符合 §6 护栏第一条）；−`shiki`、−`@shikijs/rehype`（v1 报告「附带发现」的未用依赖顺带清理） |
| `pnpm-lock.yaml` | +8/−148 | 移除 shiki 系依赖及其传递包 |
| `playwright.config.ts` | +6/−0 | **任务清单未列、本会话补记**：`process.env.no_proxy ??= 'localhost,127.0.0.1,::1'` 等 6 行——Playwright webServer 对 localhost 的健康检查在设了代理的环境被劫持的 workaround，注释标明 CI / 无代理机器惰性 |

### 7.2 门禁结果（实施会话执行；本报告撰写会话未重跑，如实标注）

| 检查 | 结果 |
|---|---|
| `pnpm install` | ✓（实施会话记录） |
| `pnpm typecheck` | ✓（实施会话记录） |
| `pnpm lint` | ✓（实施会话记录） |
| `pnpm test` | ✓（实施会话记录） |
| `pnpm --filter @blog/web build` | ✓（实施会话记录） |
| `pnpm size`（服务端 dry-run） | ✓，gzip **979.82 KiB** / 红线 3,072 KiB（实施会话记录，见 §7.3 对照） |
| e2e `markdown-performance` | ✓（实施会话记录；含视口内首块 15s 内高亮、滚动按需、单 worker、五别名断言——即 §3.4 所列断言的实跑通过） |

### 7.3 服务端 gzip 与本报告基线对照

- 实测（实施会话 `pnpm size`）：**979.82 KiB**，为红线 3,072 KiB 的 **31.9%**，余量 ~2,092 KiB。
- 对照 §2.3 基线 1,104.77 KiB：**净降 124.95 KiB（−11.3%）**。§2.3 对方案 A 的预测是「服务端 0 影响」；实际净变化为负。归因方向与 §7.1 的依赖移除对应（`@shikijs/rehype` 及其传递包、`shiki` 退出依赖树后不再进入 server 模块图），**但逐项归因（各占多少）未验证**。注意：实际分支 = 方案 A + 依赖清理两件事叠加，对照本报告预测时应分开解读。
- 结论：3 MiB 红线方向只更有利（§2.3 的 39% 前提下进一步降至 31.9%）。

### 7.4 视觉回归（真实 Chromium：仓库自带 @playwright/test 1.61 headless，1280×900，对 `pnpm dev` @5173）

汇总与截图：[docs/reports/assets/2026-10-24-visual-regression.md](assets/2026-10-24-visual-regression.md)（本会话 `ls` 复核在位：md 4,773B + 4 张截图 visual-{codeforces-round605,blocks}-{light,dark}.png 105-122KB；内容本会话通读，与实施记录一致）。**5/5 项通过**，逐项证据：

1. **明/暗色板**：明色 vitesse-light（codeforces 10 种 / blocks 9 种 distinct token 色，面板 `rgb(250,250,250)`）；点击站内暗色开关后 `html.dark` 置位、色板切 vitesse-dark（前景 `rgba(219,215,202,0.933)`）、面板 `rgb(10,16,22)`，两页 `darkColorsFollow=true`。
2. **布局**：正文容器 computed `max-width: 880px`、居中（左右留白各 200px）；blocks 页 html 块 `scrollWidth 6352 > 834` 实测可横向滚动（`scrollLeft` 0→600）且 `window.scrollX` 保持 0；字号 13px / 行高 22.1px（1.7 倍）。codeforces 页 3 块当前内容不溢出、未触发滚动（如实记录）。
3. **复制按钮**：`data-copied` 置位且 ~1.5s 后重置；`pre.textContent` 与初始纯文本源**逐字节一致**（821 / 945 字符），剪贴板读回与源相同，无多余空白/行号。
4. **渐进增强**：初始全部块 0 span 纯文本；codeforces 视口内首块自动上色（331 spans），下方两块滚动后依次上色（432 / 680 spans）；blocks 首块滚动后上色。
5. **diff**：两篇文章均无 ```diff fence（SSR HTML 与运行时 DOM 均无 `language-diff`），按任务约定不算失败；worker 侧注色逻辑存在（`markdown-highlight.worker.ts:9-23`）但**未在站内文章路径实测**——§3.3 样张页仍是 diff 效果的唯一展示。

### 7.5 重要附注（实施会话提供）

- **(a)** blocks 页实际有 **3 个代码块（2 js + 1 html）**，非任务所述 2 个 js；html 块长行恰好提供了横向滚动证据。
- **(b)** 渐进增强附注：正文位于 app-shell main 内部滚动容器，IO 的 400px rootMargin 预载带不穿透祖先 overflow clip——视口下方 400px 内被裁剪的块（blocks 首块 top 1104 > 900）不预载、滚入可视区才上色；已用原生 IntersectionObserver 对照实验证实（rect [1104,1960] vs rootBounds [−400,1300] 仍 `isIntersecting=false`），属标准浏览器行为、无功能缺陷。
- **(c)** 工具链说明：browser-use:control-browser（IAB）实测其 IntersectionObserver 对视口内元素零回调（独立对照 4s 无回调）、clipboard 因 `Document is not focused` 不可用，无法验证滚动上色；browser-harness 被 macOS TCC 拒绝读取 Chrome DevToolsActivePort（`--doctor` FAIL）无法启动；故核心验证改用仓库 Playwright + 真实 Chromium 完成（IAB 中已另证 hydration、事件委托、worker 管道本身正常）。
- **(d)** blocks 页 4 个 404 为文章引用的 legacy 图片（`/api/asset/images/legacy/github-blocks*.png`）不在本地环境，与高亮引擎无关。
- **(e)** dev server 已停止、临时验证脚本已删除（本会话核实：`git status` 仅余 §7.1 的 4 文件改动 + `docs/reports/` 未跟踪，无临时脚本残留）。

### 7.6 与本报告前文结论的对照

- §4 核对表的暗色模式 / 复制按钮 / 懒加载三项已由站内真实页面复证（§7.4-1/2/3/4）；Worker 浏览器路径可运行性经 `pnpm dev` + `pnpm build` 双门禁复证。
- §5.1-1 与 §6 护栏的 diff 红绿补丁已落地（:9-23），但站内文章无 diff 块，效果验证仍止于 §3.3 静态样张。
- §6 的「锁精确版本」护栏已满足（`"0.2.0"`，§7.1）；「合并前实跑 e2e + 浏览器逐页回归」已按 AGENTS.md §9 执行（§7.2/§7.4）；`docs/architecture.md:33,110` 文档同步**尚未完成**（改动清单中无该文件，待办）。
- 仍空白：真实 CF 生产部署、Firefox、低端移动设备、CF 生产 isolate CPU 口径（§5.2-6）；门禁与 e2e 均为实施会话记录，本报告撰写会话未重跑。
