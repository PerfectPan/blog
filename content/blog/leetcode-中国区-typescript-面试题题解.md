---
date: 2020-04-13T14:49:46.666Z
title: LeetCode 中国区 TypeScript 面试题题解
description: TypeScript 类型编程题
tag:
  - TypeScript
---
#### 写在前面

最近在学 TypeScript, 对类型编程有点感兴趣？虽然自己可能对这方面还是一无所知。恰好发现LeetCode国区有这么道开源的[面试题](https://github.com/LeetCode-OpenSource/hire/blob/master/typescript_zh.md)，就拿过来做了下。

---
#### 简要题解

其实分析一下我们的需求就是两点：
１．将EffectModule类的函数签名的类型改了
２．将EffectModule类的非函数属性都去掉

对于第一点，我们可以直接根据题目的要求遍历实例的键，利用infer的推断能力拿到payload的属性还有函数签名里Promise和Action泛型里的值，拿到后根据题目要求换成需要的函数签名即可：

```typescript
type Change<T> = {[K in keyof T]: 
  T[K] extends ((input: Promise<infer P>) => Promise<{payload: infer U;type:string}>)? 
    ((input: P) => Action<U>):
  T[K] extends ((action: Action<infer P>) => {payload: infer U;type:string})?
    ((action: P) => Action<U>):
  never;}

const effectModule = new EffectModule();
type test = Change<typeof effectModule>;
```

经过Change的变换后我们得到的test类型其实是包含 ```count:never``` 和 ```message:never``` 两个属性，我们要去掉它，所以我们利用extends判断类型是不是函数从而拿出EffectModule类的非函数属性键的名字，然后利用Omit方法去掉这些非函数属性的键即可，具体实现如下：

```typescript
type omitFuncKeys<T> = {[K in keyof T]: T[K] extends Function? never: K}[keyof T];
type final = Omit<Change<typeof effectModule>, omitFuncKeys<EffectModule>>;
```
---
#### 完整代码：

```typescript
import { expect } from "chai";

interface Action<T> {
  payload?: T;
  type: string;
}

class EffectModule {
  count = 1;
  message = "hello!";

  delay(input: Promise<number>) {
    return input.then(i => ({
      payload: `hello ${i}!`,
      type: 'delay'
    }));
  }

  setMessage(action: Action<Date>) {
    return {
      payload: action.payload!.getMilliseconds(),
      type: "set-message"
    };
  }
}
// 实现部分
type Change<T> = {[K in keyof T]: 
  T[K] extends ((input: Promise<infer P>) => Promise<{payload: infer U;type:string}>)? 
    ((input: P) => Action<U>):
  T[K] extends ((action: Action<infer P>) => {payload: infer U;type:string})?
    ((action: P) => Action<U>):
  never;}

const effectModule = new EffectModule();
type omitFuncKeys<T> = {[K in keyof T]: T[K] extends Function? never: K}[keyof T];
type final = Omit<Change<typeof effectModule>, omitFuncKeys<EffectModule>>;
// 修改 Connect 的类型，让 connected 的类型变成预期的类型
type Connect = (module: EffectModule) => final;

const connect: Connect = m => ({
  delay: (input: number) => ({
    type: 'delay',
    payload: `hello 2`
  }),
  setMessage: (input: Date) => ({
    type: "set-message",
    payload: input.getMilliseconds()
  })
});

type Connected = {
  delay(input: number): Action<string>;
  setMessage(action: Date): Action<number>;
};

export const connected: Connected = connect(new EffectModule());
```
