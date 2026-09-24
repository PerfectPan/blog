# 动效（背景与入场动画）

全站动效分两类：**背景**（layout 里常驻的一块 canvas）和**入场动画**（页面挂载时跑一次的
CSS 动画）。本文记录每个动效的名字、实现位置、调参入口和必须守住的约束。数值的权威定义在
代码里（各文件顶部的常量），这里只说明它们控制什么。

## 1. 名称速查

| 名称 | 类型 | 效果 | 实现 |
| --- | --- | --- | --- |
| **走线 Traces** | 背景（宽屏） | 电路走线从视口边缘生长：8 方向网格、45°/90° 转折、分叉，末端是琥珀色小方块节点 | `apps/web/src/components/trace-background.tsx` |
| **点阵波面 Dot Wave** | 背景（窄屏） | 点阵上滚动的 3D 波面：点的大小和亮度由高度与左上光照决定，呈现外凸 / 内陷 | `apps/web/src/components/dot-wave.ts` |
| **打字命令 Typed Prompt** | 入场 | 提示符里的命令逐字打出，方块光标闪两下后消失 | `Prompt` 的 `typed`（`page.tsx`）+ `term-type` / `term-caret`（`styles.css`） |
| **字符画打印 FIGLET Print** | 入场（仅首页） | 首页 FIGLET 字符画按行从上往下出现 | `term-print`（`styles.css`） |
| **上浮 Enter / 逐行 Enter Row** | 入场 | 卡片、面板、正文淡入上浮；列表行淡入右移，错峰出现 | `ENTER` / `ENTER_ROW` / `enterDelay`（`term.ts`） |

走线的思路来自 antfu.me 的 plum（随机生长的树枝），改成网格走线以贴合终端主题；点阵波面
同样参考了 antfu.me 移动端的点阵，但机制不同（高度场 + 光照，不是噪声流场）。

## 2. 背景：走线 / 点阵波面

`TraceBackground` 挂在 `layout.tsx`，全站只有一个实例，导航不会重新挂载。

**模式选择**：背景测量 `Page` 容器（带 `data-page` 属性）的正文区域：

- 内容列两侧空白够宽（≥ `MIN_GUTTER` 格）→ 走线；
- 不够宽（手机、窄窗口）→ 点阵波面；
- 当前路由没有 `Page`（admin、logout）→ 不画。

**约束**：

- **内容列是软墙**：走线主要在两侧空白里长；到达列边缘时小概率进入（`ENTER_COLUMN`），进入后
  不分叉、很快结束（`SURVIVE_IN_COLUMN`），并由 mask 压到约 10% 强度（`MASK_COLUMN`）。
  目的：让两侧有连接感，但线不压在文字上。点阵波面整屏铺开，靠中心压暗（`DIM_*`）。
- **不重复生长**：只有 canvas 尺寸或内容列位置变化才重长。canvas 高度是 `100lvh`，移动端
  工具栏收放不会触发重长；`main` 的 `scrollbar-gutter: stable` 保证长短页切换时列不偏移。
  新增页面只要用 `Page`，列宽一致就会沿用当前背景。
- **主题**：颜色读自 `--muted-foreground` / `--primary`，切换主题时即时重绘，不重长。
- **性能**：走线长完即停止 rAF；点阵波面常驻，按时间节流到约 30fps（`DOT_FRAME_MS`），
  页面不可见时 rAF 自动暂停。
- **reduced motion**：走线同步长完直接画成品，点阵波面只画一帧。

**调参**：生长速度 `FRAMES_PER_TICK`，密度 `COVERAGE` / `FORK`，走线进入内容列的频率与深度
`ENTER_COLUMN` / `SURVIVE_IN_COLUMN`；点阵波面强弱 `ALPHA_MAX` / `SIZE_MAX` / `SHIFT`。
改完用浏览器看实际渲染（见 AGENTS.md §9），仅靠类型检查看不出效果。

## 3. 入场动画

**用法**：

- 页面顶部提示符写 `<Prompt ... typed>命令</Prompt>`。只有纯文本命令会打字；子节点含元素时
  （例如 `cd ..` 链接）照常直接显示。打字时长按字符数算，封顶 `TYPE_MS_MAX`。
- 其余块用 `term.ts` 的 `ENTER`（块）或 `ENTER_ROW`（列表行），配合
  `style={enterDelay(ms)}` 错峰；页面正文统一用 `BODY_ENTER_DELAY_MS`。

**约束**：

- **重叠而不是串行**：内容在打字进行中就开始出现，整页约 0.7s 内就位。不要让内容等动画。
- **只用 `fill-mode: backwards`**：延迟期间保持隐藏，结束后释放。`both` / `forwards` 会让结束
  后的 transform / opacity / clip-path 效果一直生效，元素常驻合成层和层叠上下文。
- **只动画 animation 属性**：时长用 `animation-duration-*`，不要用 Tailwind 的 `duration-*`
  （它同时设置 `transition-duration`，会让元素所有样式变化都带过渡）。
- 所有入场动画都带 `motion-safe:` 前缀，reduced motion 下直接显示最终状态。
