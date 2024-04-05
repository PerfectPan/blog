---
date: 2023-02-18
title: 初探 Github Blocks
description: 初探 Github Blocks
tag:
  - Misc
---

## 什么是 Github Blocks

[Github Blocks](https://blocks.githubnext.com/) 是 Github 提供的扩展你的 CodeBase 的方式，他试图改变你在网站上查看 Github 代码的方式。Block 的基本单位有两种，一个是 File，一个是 Folder，当你浏览一个代码文件或者代码文件夹的时候，可以通过切换不同的 Block 去决定如何渲染你的代码。

如图所示，红框框住的位置就是我们切换 Block 的地方，下面一整块是渲染这个 excalidraw 文件的结果。

![images](/images/github-blocks.png)

点击红框框住的地方我们可以看到其他可以渲染这个文件类型的 Block，我们可以点击切换，同时我们可以在搜索栏上搜索 Block，可以搜文字来筛选，也可以直接贴别人 Block 代码仓库的 URL，这其实是为了能够搜索出隐藏的 Block，因为如果一个开发者想要对外暴露 Block，他就必须要在他的仓库上打一个 `github-blocks` 的标签才能被 Github 找到，但我们仍然可以通过贴 URL 的方式找到这个隐藏的 Block。

![images](/images/github-blocks-picker.png)

目前官方已经提供很多 Block 了，比如 Markdown Block，JSON Block，JS Sandbox Block 等等。
## 如何开发 Github Blocks

当社区已有的 Block 不能满足你的需求的时候，你可以自行去开发一个 Block，官方也提供了很好的[模版代码](https://github.com/githubnext/blocks-template)和[开发教程](https://github.com/githubnext/blocks/tree/main/docs/Developing%20blocks)，这里只简单的讲一下。

通过模版代码和开发教程我们可以了解到一个 Block 项目需要在项目根目录存放一个 blocks.config.json 的文件，里面描述了你项目 Block 的信息，比如标题，描述，是 File Block 还是 Folder Block，可以识别的后缀，比如只有 .js 后缀的文件才能使用我的 Block，Block 加载的入口地址等，支持多 Block 的开发。然后你只需要在对应的文件实现一个 React 组件，最后调用官方提供的[脚手架](https://github.com/githubnext/blocks-dev)去打包你的代码即可。Github 会往 React 组件里去注入他暴露的能力，和一些生命周期钩子。

整体开发体验是挺好的，通过脚手架的命令启动以后我们就可以在 Github 页面上去调试我们的 Block 了，通过阅读脚手架的代码，我们可以知道它整体是基于 vite 和 esbuild 来实现本地开发和最终打包的，最终打包出来的代码是以 `var BlockBundle = function() { ... }` 的格式，同时 exclude 掉了 React 相关的库。

```js
// https://github.com/githubnext/blocks-dev/blob/main/scripts/build.js
const esbuild = require("esbuild");
const path = require("path");

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

require('./config/env');

const build = async () => {
  const blocksConfigPath = path.resolve(process.cwd(), "blocks.config.json");
  const blocksConfig = require(blocksConfigPath);

  const blockBuildFuncs = blocksConfig.map((block) => {
    return esbuild.build({
      entryPoints: [`./` + block.entry],
      bundle: true,
      outdir: `dist/${block.id}`,
      format: "iife",
      globalName: "BlockBundle",
      minify: true,
      external: ["fs", "path", "assert", "react", "react-dom", "@primer/react"],
      loader: {
        '.ttf': 'file',
      },
    });
  });

  try {
    await Promise.all(blockBuildFuncs);
  } catch (e) {
    console.error("Error bundling blocks", e);
  }
}
build()

module.exports = build;
```

## Github Blocks 实现原理介绍

上文提到在开发 Blocks 的过程中，我们只需要对外暴露一个 React 组件，而且最终打包的时候 exclude 掉了 React 相关的库，那么他最终是如何加载的呢？

查看源代码我们可以到整个 Block 的加载就是加载了一个 iframe 标签，iframe src 上的哈希值存储了待加载 Block 的源信息。然后里面会有一段 runtime 的代码，这段代码也已经[开源](https://github.com/githubnext/blocks-runtime)了。

```html
<iframe class="w-full h-full" allow="camera;microphone;xr-spatial-tracking" sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation-by-user-activation allow-popups" src="https://blocks-sandbox.githubnext.com#%7B%22block%22%3A%7B%22type%22%3A%22folder%22%2C%22id%22%3A%22dashboard%22%2C%22title%22%3A%22Dashboard%22%2C%22description%22%3A%22View%20other%20blocks%20in%20a%20dashboard%20view%22%2C%22entry%22%3A%22blocks%2Ffolder-blocks%2Fdashboard%2Findex.tsx%22%2C%22example_path%22%3A%22https%3A%2F%2Fgithub.com%2Fgithubnext%2Fblocks-tutorial%22%2C%22owner%22%3A%22githubnext%22%2C%22repo%22%3A%22blocks-examples%22%7D%2C%22context%22%3A%7B%22repo%22%3A%22blocks%22%2C%22owner%22%3A%22githubnext%22%2C%22path%22%3A%22docs%2FDeveloping%20blocks%22%2C%22sha%22%3A%22main%22%7D%7D"></iframe>
```

通过阅读代码我们可以知道整个 Block 在加载的时候首先会加载这个 runtime 的代码，runtime 做的工作就是和主页面进行通信，当页面加载好的时候会发送 [loaded](https://github.com/githubnext/blocks-runtime/blob/main/src/events.ts#L100) 信息告诉主页面，然后主页面会把相关信息（当前浏览的文件内容，还有加载 Block 的代码）发送过来，这时候 runtime 就来加载我们的 Block，具体加载的方式就是把我们的代码变成一个 script 标签 append 进 DOM 树：

```js
const loadReactContent = (content: string) => {
  return `
var BlockBundle = ({ React, ReactJSXRuntime, ReactDOM, ReactDOMClient, PrimerReact }) => {
  function require(name) {
    switch (name) {
      case "react":
        return React;
      case "react/jsx-runtime":
        return ReactJSXRuntime;
      case "react-dom":
        return ReactDOM;
      case "react-dom/client":
        return ReactDOMClient;
      case "@primer/react":
      case "@primer/components":
        return PrimerReact;
      default:
        console.log("no module '" + name + "'");
        return null;
    }
  }
${content}
  return BlockBundle;
};`;
};
```

从代码里可以看到打包时候 exclude 掉的库文件通过 runtime 注入的形式补上了，这样可以让业务代码体积尽可能的小，同时 runtime 是复用的，因为当你切换 Block 的时候本质上是切换 url 的 hash，不会触发整个 iframe 的重新加载，iframe 里的页面监听到 hash 发生变化了就会再向主页面去要相关的信息来完成下一次的渲染，因此差值是你的业务代码包的大小。

append 进 DOM 树以后，window 对象上就有 BlockBundle 这个函数了，runtime 这时候去调用执行渲染 Block 的代码就完成首次渲染了。

通过 Runtime 的代码阅读我们也可以知道 Blocks 提供其他技术栈的开发方式，但是全局变量名字要叫 VanillaBlockBundle，官方也提供了 [Vue](https://github.com/githubnext/blocks-template-vue) 和 [Svelte](https://github.com/githubnext/blocks-template-svelte) 的模版代码，从模版代码我们可以看出官方是希望你用 React 的技术栈的，毕竟 Vue 和 Svelte 需要额外打一个对应库的 runtime 进来，性能会有点受损。

## 总结

本文从使用到开发到实现介绍了 Github Blocks，其实 Github 已经提供了代码查看，代码编辑和版本管理，如果能用 Block 去实现在线加载代码并展示，那已经可以实现一个简陋版的 Cloud IDE 了（缺少 Terminal，Extension 等功能），但这个功能本身就已经和市面上的很多产品重叠了（stackblitz，codesandbox），所以看起来实现这个也没有什么意义。整体体验下来功能会比较鸡肋，因为你还要去 blocks.githubnext.com 才能体验，当然这个功能可能是因为没有 public 所以暂时以这种方式见面，然后整体交互会感觉比较重，频繁的切换 Block 性能感觉很差，也没有看到是否能固定一个 Folder Block 展示，这样其实是不能实现我去改其他代码，然后整个项目相关的内容刷新的（或许需要一个 Project Block？），会有一个来回切换加载 Block 的过程，目前想不太到更加有想象力的 Block，只能说期待后面社区的 idea 吧。
