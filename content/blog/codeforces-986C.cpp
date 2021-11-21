---
date: 2018-06-01
title: Codeforces 916E Jamie and Tree
description: Codeforces 916E Jamie and Tree
tag:
  - Graph Theory
---

**题目链接**：[https://codeforces.com/contest/986/problem/C](https://codeforces.com/contest/986/problem/C)

**题意**：给你 $ m $ 个数字，每个数字两两可以连边的条件是 $ x\& y==0 $ ，求生成图的连通块数量。

**思路**：本质还是要优化建图，因为暴力连边肯定是不可取的。我们考虑新建 $ 2^n $ 个点分别为 $ [0,2^n-1] $ ，这样图中即有 $ m+2^n $ 个点，对于新建点的内部的连边我们这样做：对于数字 $ x $ 我们二进制展开去找为 $ 0 $ 的位，假设为 $ i $ ，那么我们就连一条 $ x $ -> $ x\oplus (2^i) $ 的边。然后对于序列中的点我们假设为 $ x $ ，那么 $ x $ 要向新建点权值为 $ x $ 的点连一条边，而对于新建的点，我们连一条 $ x->(2^n-1-x) $ 的出边，然后去跑 $ dfs $ 数连通块即可。这样的正确性说明： $ x\& y==0 $ 可以知道 $ y $ 按位取反以后的数里面的 $ 1 $ 的位数一定包含 $ x $ 中 $ 1 $ 的位数，所以对于 $ x $ 我们每次 $ dfs $ 进入新建的 $ 2^n $ 个点中的图以后相当与每次找一个为 $ 0 $ 的位数然后把这一位填上 $ 1 $ 继续 $ dfs $ 保证了他能找到所有 $ y $ 按位取反以后的点。然后对于这些点有因为连了一条出边到按位取反的点，所以我们即可找到一条从 $ x $ 到满足条件的 $ y $ 的路径，时间复杂度 $ O(n2^n) $ 。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
	while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
	return x=f?-x:x;
}
const int N=(1<<22)+10;
int n,m,i,mx,cnt,a[N];
bool vis[N][2],exist[N];
void dfs(int x,int tp){
	if (vis[x][tp]) return;
	vis[x][tp]=1;
	if (tp==0) dfs(x,1);
	else{
		for (int i=0;i<n;i++){
			if (!(x&(1<<i))) dfs(x^(1<<i),1);
		}
		if (exist[mx^x]) dfs(mx^x,0);
	}
}
int main(){
	read(n),read(m);
	for (mx=(1<<n)-1,i=1;i<=m;i++) read(a[i]),exist[a[i]]=1;
	for (i=1;i<=m;i++)if(!vis[a[i]][0]){
		cnt++;
		dfs(a[i],0);
	}
	printf("%d\n",cnt);
	return 0;
}
```

