---
date: 2018-09-11
title: AtCoder Regular Contest 100 E Or Plus Max
description: AtCoder Regular Contest 100 E Or Plus Max
tag:
  - DP
---

**题目链接**：[https://arc100.contest.atcoder.jp/tasks/arc100_c](https://arc100.contest.atcoder.jp/tasks/arc100_c)

**题意**：给你一个长度为 $2^n-1$ 的序列 $a$，要求对每个 $1\le k\le 2^n-1$ 找出最大的 $a_i+a_j(i|j\le k)$。

**思路**：对于每个位置 $k$ 我们求出 $i|j=k$ 的最大的 $a_i+a_j$ 然后求一遍前缀最大值就可以得到每个 $k$ 的答案了，然后对于前面的子问题，不难发现 $i$ 和 $j$ 一定是 $k$ 的子集，所以直接高维前缀和求一遍最大值和次大值即可，时间复杂度 $O(n2^n)$。

```cpp
#include <bits/stdc++.h>
using namespace std;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<'0' || ch>'9') f|=(ch=='-'),ch=getchar();
	while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
	return x=f?-x:x;
}
const int N=(1<<18)+10;
int n,i,j,status,a[N];
pair<int,int> f[N];
inline void up(pair<int,int> &a,pair<int,int> b){
	if (b.second>=a.first){
		a=b;
	}
	else if (b.first>=a.first){
		a.second=a.first;
		a.first=b.first;
	}
	else if (b.first<a.first && b.first>=a.second){
		a.second=b.first;
	}
}
int main(){
	read(n);
	for (i=0;i<(1<<n);++i){
		read(a[i]);
		f[i].first=a[i];
	}
	for (i=0;i<n;++i){
		for (status=0;status<(1<<n);++status){
			if (status&(1<<i)) up(f[status],f[status^(1<<i)]);
		}
	}
	int res=0;
	for (i=1;i<(1<<n);++i){
		res=max(res,f[i].first+f[i].second);
		printf("%d\n",res);
	}
	return 0;
}
```
