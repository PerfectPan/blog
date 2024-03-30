---

date: 2021-05-08

title: Type Challenge - 冒泡排序

description: 用 TypeScript 类型实现冒泡排序

tag:

  - TypeScript

---

## 背景

受公司内一位大神写的一篇用 TypeScript 类型实现斐波那契数列，萌发了用 TypeScript 类型实现冒泡排序的想法，于是有了这篇文章，文中的一些 Util 类型很多搬运了那篇文章，因此在这里提前感谢那位大神。

**注：本文代码在 TypeScript 4.2.3 的版本下跑通，低版本可能出现部分特性不支持的情况。同时由于本人水平很低，本文实现并不是很完美，存在很多限制以及潜在可以改进的地方，欢迎指出，不吝赐教。**

## 目标

用 TypeScript 类型实现冒泡排序，即：

```typescript
type Result = BubbleSort<[2, 3, 30, 6, 1, 4]> // type Result = [1, 2, 3, 4, 6, 30]
```

## 思路

首先我们需要知道冒泡排序的算法原理以及用 JavaScript 实现的代码，由于整个算法不是很复杂，故这里贴一下百度百科的词条来做参考：https://baike.baidu.com/item/%E5%86%92%E6%B3%A1%E6%8E%92%E5%BA%8F/4602306?fr=aladdin。

对应的 JavaScript 代码如下：

```javascript
function bubbleSort(arr) {
    for (let i = 0; i < arr.length; ++i) {
        for (let j = arr.length - 1; j > i; --j) {
            if (arr[j - 1] >= arr[j]) {
                arr[j - 1] = arr[j - 1] ^ arr[j];
                arr[j] = arr[j] ^ arr[j - 1];
                arr[j - 1] = arr[j - 1] ^ arr[j];
            }
        }
    }
    return arr;
}
```

用 TypeScript 类型实现一个基于比较的排序算法核心点要解决三个问题：

1. 实现两个数字的比较
2. 嵌套循环的处理
3. 相邻数字的交换

我将在下文一一讲述。

### 实现两个数字的比较

在 TypeScript 的体系里是没有数字比较的概念的，我们需要另辟蹊径，这里给出的方案（也是上文提到那篇文章的方案）为创建对应数字大小长度的 Array，然后不断弹出出元素，看哪个 Array 长度先为 $0$ 即可比较出大小。

#### 一些 Util 类型

首先定义一些后面会用到的工具类型：

```typescript
// 数组长度
type Length<T extends any[]> = T['length'];
// And 操作
type And<X extends boolean, Y extends boolean> = X extends true ? Y extends true ? true : false : false; 
// 判断数组是否非空
type NotEmpty<T extends number[]> = Length<T> extends 0 ? false : true;
// 判断数组是否为空
type IsEmpty<T extends number[]> = NotEmpty<T> extends true ? false : true;
// 数组 shift 操作
type Shift<T extends number[]> = T extends [unknown, ...infer R] ? R : [];
```

#### 给定数字如何创建对应长度的数组

一个简单的思路为 for 循环创建：

```typescript
function createArray(targetNumber: number) {
    const newArray = [];
    for (let i = 0; i < targetNumber; ++i) {
    	newArray.push(0);
	}
    return newArray;
}
```

由于 TypeScript 不支持循环，我们只能用递归来代替循环，终止条件为已创建的数组长度等于给定数字，然后不断递归往待创建的数组中推入任意元素，具体实现如下：

```typescript
type CreateArray<T extends number, P extends number[] = []> = Length<P> extends T ? P : CreateArray<T, [0, ...P]>;
```

**注：在低版本 TypeScript 中其实是不支持如上的自递归，那时候如果要实现可以借助对象来绕过去，具体实现如下，后面如果出现自递归也可以同理这么修改，不再赘述：**

**注2：TypeScript 的递归深度是有限制的，不超过 $50$，因此不能表示很大的数字，这也是本文实现的一个很大的缺陷。**

```typescript
type CreateArray<T extends number, P extends number[] = []> = {
    0: CreateArray<T, [0, ...P]>,
    1: P
}[Length<P> extends T ? 1 : 0];
```

#### 比较两个数字大小

有了上述的基础，再来实现就不是很难了，假定我们要实现如下比较 $A$ 是否小于等于 $B$ 的类型：

```typescript
type LessEqual<A extends number, B extends number> // 如果 A <= B 返回 true，否则返回 false
```

根据前文所说的我们创建对应长度的数组，不断同时弹出两个数组的元素，如果 $A$ 对应的数组先空，即返回 $\rm true$ 否则返回 $\rm false$ 。

```typescript
// 如果两个数组都非空（And<NotEmpty<A>, NotEmpty<B>>）则继续递归弹出两个数组的元素（LessEqualArray<Shift<A>, Shift<B>>），直到有一个为空，如果 A 对应的数组先空了，则说明 A <= B
type LessEqualArray<A extends number[], B extends number[]> = And<NotEmpty<A>, NotEmpty<B>> extends true ? LessEqualArray<Shift<A>, Shift<B>> : IsEmpty<A> extends true ? true : false;
type LessEqual<A extends number, B extends number> = LessEqualArray<CreateArray<A>, CreateArray<B>>;
```

### 嵌套循环的处理

冒泡排序需要一个嵌套的 for 循环，外层循环控制 $n - 1$ 轮比较，内层循环每次从数组末尾开始不断比较相邻元素 $\textit{arr}[j-1]$ 和 $\textit{arr}[j]$，如果 $\textit{arr}[j-1]>\textit{arr}[j]$ 则交换相邻数字，这样一轮比较后待排序的元素中最小的元素就会冒泡到数组前面。

而前文在讲述创建对应长度的数组已经提到针对一个 for 循环我们可以用自递归的方法来实现，因此我们是有实现单层循环的能力的，那么嵌套循环也就很好解决：我们可以再定义一个类型表示内层循环，循环每次返回一轮比较后的数组即可。

我们先定义外层循环的类型：

```typescript
type BubbleSort<T extends number[], Index extends number = 0>
```

其中 $T$ 表示待排序的数组，$\textit{Index}$ 表示外层的循环变量。按照前文所述，循环，或者说递归终止的条件为 $\textit{Index} $ 等于 $\textit{len} - 1$，每次递归不断将 $\textit{Index}$ 加一。因此我们还需要实现数字的自增和自减的类型，由前面的铺垫，这个也不难实现：

```typescript
// 自增
type Inc<A extends number> = Length<CreateArray<A> extends [...infer U] ? [...U, 0] : []>;
// 自减
type Dec<A extends number> = Length<CreateArray<A> extends [...infer U, any] ? U : []>;
```

至此外层循环类型实现就呼之欲出了：

```typescript
type BubbleSort<T extends number[], Index extends number = 0> = 
    Inc<Index> extends Dec<Length<T>> ? T : BubbleSort<OnceBubble<T, Index>, Inc<Index>>;
```

其中 `OnceBubble<T, Index>` 为我们要实现的内层循环，它返回一轮比较后的新数组，具体实现结合下一小节给出。

#### 相邻数字的交换

由于我 TypeScript 水平本身比较薄弱，不能给出很优雅的方法来实现数字的交换，因此给出的方案需要在内层循环自递归的时候额外记录一个数组 $\textit{SuffixArray}$ 表示当前已经比较过的元素数组。

定义内层循环的类型：

```typescript
type OnceBubble<T extends number[], I extends number = 0, J extends number = Dec<Length<T>>, SuffixArray extends number[] = []>
```

其中 $T$ 为待排序数组，$I$ 表示循环终止条件，即外层循环变量，$J$ 表示内层循环变量，从 $\textit{len}-1$ 开始，$\textit{SuffixArray}$ 表示 $[J + 1, \textit{len} -1]$ 这段已经比较过的数组元素。

有了 $\textit{SuffixArray}$ 我们就可以愉快的进行交换了，整体实现如下：

```typescript
type OnceBubble<T extends number[], I extends number = 0, J extends number = Dec<Length<T>>, SuffixArray extends number[] = []> = 
    J extends I 
    ? T : LessEqual<T[Dec<J>], T[J]> extends true
    ? OnceBubble<T, I, Dec<J>, [T[J], ...SuffixArray]> :
    OnceBubble<
        T extends [...infer PreArray, infer A, infer B, ...SuffixArray] ? [...PreArray, B, A, ...SuffixArray] : [],
        I,
        Dec<J>,
        [T[Dec<J>], ...SuffixArray]
    >;
```

即如果没有循环结束，那么我们比较相邻元素的大小，如果发现不用交换就执行 `OnceBubble<T, I, Dec<J>, [T[J], ...SuffixArray]>`，否则利用 $\rm infer$ 的能力重组出交换后的数组：

```typescript
T extends [...infer PreArray, infer A, infer B, ...SuffixArray] ? [...PreArray, B, A, ...SuffixArray] : []
```

内层循环结束的时候返回交换后数组即可。

至此，我们实现了整个冒泡排序。

## 完整代码

- [Playground](https://www.typescriptlang.org/play?ts=4.2.3&ssl=1&ssc=1&pln=23&pc=46#code/C4TwDgpgBAMhB2BzYALAPAFShAHsBAJgM5QCG8IA2gLoB8UAvFBpQOQA2CyKr1A3AChQkKAEF4BNAA1seQiQBGAeyWdyAGigBNWfgmKVa+PSYzce4lGAAnAK7QA-Nt3yrdx2-tQAXFABmpOxE0L4BQRB8UELg0ADKKACWfsCYLvpQ8LYAtgoQ1jQmzGmWlLbwANbwSgDu8JoAdI0J8H55UABK1FBO7T5QNILC0ABySsAAollgoKnmrpk5eQWMsFyomPRz6QAM3f6BwX029oMxUACSRJPTILNy6Qu5+XQroxNTMxib95bHHmGHXx-U4iADC1ggpHwoms1lItywW0sjzymgACsUSCjnitlkw4Eh1mjvhYSFgnBjfODIdDYfDMJpKNsGo00XQQdA4EQrgBHWyBGFw26iTEZbJPGiaABCouxeLEEjQb2uM1EtE0yo+tyltBJrj+ey5vP57EF9PiSRSas0FuSaB19F8lxVwr16QNTgNoQOEWiIiN4z5gTQIqRWPFqKgMrDYsW1kKAaDprpt2pUIgZtdmjTtKF9t1HIu8AAxiHZRH4ysCdw0DmMymQ26So16s1WtYoABVLpOSgtzuabZdXwFQsAEQgpdDP3DcYTa3QdczjdFfaaLTaA7IFB7Xb6o790AA8iWIFLbAoFJw7qTYxLqJpzuW4ytmVAAFLPp4rCel6vrL51SgWJbD8PwEhwTMvyWLomHlAQoEQj9RSfBCkKcLBfETE1MEoX80HfWgH2YSh3xeGM-jQxCnBPYszwvK8IAZC5NHwwjGRYMiWXqECwIgzMXm8KioFo+jL2vYSkKKGM11bDcOzRCFM00Ns2lEFT5KjbjePAyCU13WTFPrIVpU0dSoBbHT+P0-cH0kpDznUezELY9VnP6FhXOIyzQN0gThNoQtz3EiBYiUawUkRGc7xgx8JFwaCOyYbZCmE84SzQdKCFwJsSHw-90EAvZMKjBjODCiK0FE4LGOYrKcri0t6pwAtDw6CAiFsdhgBWGryvClJKAAJk0ABmMa3wANk0ABGTQABY6CAA)

```typescript
type Length<T extends any[]> = T['length'];
type And<X extends boolean, Y extends boolean> = X extends true ? Y extends true ? true : false : false; 
type Shift<T extends number[]> = T extends [unknown, ...infer R] ? R : [];
type NotEmpty<T extends number[]> = Length<T> extends 0 ? false : true;
type IsEmpty<T extends number[]> = NotEmpty<T> extends true ? false : true;
type CreateArray<T extends number, P extends number[] = []> = Length<P> extends T ? P : CreateArray<T, [0, ...P]>;
type LessEqualArray<A extends number[], B extends number[]> = And<NotEmpty<A>, NotEmpty<B>> extends true ? LessEqualArray<Shift<A>, Shift<B>> : IsEmpty<A> extends true ? true : false;
type LessEqual<A extends number, B extends number> = LessEqualArray<CreateArray<A>, CreateArray<B>>;
type Inc<A extends number> = Length<CreateArray<A> extends [...infer U] ? [...U, 0] : []>;
type Dec<A extends number> = Length<CreateArray<A> extends [...infer U, any] ? U : []>;
type OnceBubble<T extends number[], I extends number = 0, J extends number = Dec<Length<T>>, SuffixArray extends number[] = []> = 
    J extends I 
    ? T : LessEqual<T[Dec<J>], T[J]> extends true
    ? OnceBubble<T, I, Dec<J>, [T[J], ...SuffixArray]> :
    OnceBubble<
        T extends [...infer PreArray, infer A, infer B, ...SuffixArray] ? [...PreArray, B, A, ...SuffixArray] : [],
        I,
        Dec<J>,
        [T[Dec<J>], ...SuffixArray]
    >;
type BubbleSort<T extends number[], Index extends number = 0> = 
    Inc<Index> extends Dec<Length<T>> ? T : BubbleSort<OnceBubble<T, Index>, Inc<Index>>;
type Result = BubbleSort<[2, 3, 30, 6, 1, 4]>
```

## 回顾

本文实现其实存在很多不足，比较致命的就是受限于 TypeScript 递归的深度限制，只能对较小的数字以及较短的数组进行排序，不过本身就是一个没什么用的东西（划掉），所以开心就好，娱乐至上，一切内容仅供参考。