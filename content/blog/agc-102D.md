---
date: 2018-09-01
title: AtCoder Regular Contest 102 D All Your Paths are Different Lengths
description: AtCoder Regular Contest 102 D All Your Paths are Different Lengths
tag:
  - Constructive Algorithm
---

**题目链接**：[https://arc102.contest.atcoder.jp/tasks/arc102_b](https://arc102.contest.atcoder.jp/tasks/arc102_b)

**题意**：给定一个长度 $L$，构造一个图，满足编号小的向编号大的连边，权值自己设，允许重边，使得一共有 $L$条路，且每条路权值为 $[0,L-1]$ 中的一种且不重复，点数不超过 $20$，边数不超过 $60$。

**思路**：用一个数系去完整的表示 $[0,L-1]$ 中每一个数，很容易想到用 $2$ 进制，那我们先找一个最大的 $n$，满足 $2^n-1<=L-1$，然后连边就很容易了，$i->i+1$ 连两条边权分别为 $0$ 和 $2^{i-1}$ 的边，代表选或不选，这样我们就可以表示出 $[0,2^{n-1}]$ 里所有的数，然后考虑不满的部分，意识流一下应该能调出来。。大概就是考虑 $1010100$ 这么一个数，那么 $10100XX$，即把那一位 $1$ 翻转，则 $XX$ 的部分就是选或不选都可以，所以我们把 $3$ 向 $n$ 连一条权值为 $1010000$ 的边即可，以此类推，最后 $1$ 向 $n$ 连一条 $L-1$ 的边即可。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
	while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
	return x=f?-x:x;
}
const int N=20+5;
int L,i,j,m,POW[N];
vector<pair<int,int> >G[N];
int main(){
	read(L);
	int x=1,n=1;
	for (;x<L;x*=2) n++;
	if (x>L) n--;
	for (POW[0]=1,i=1;i<=20;i++) POW[i]=POW[i-1]*2;
	for (int i=1;i<n;i++){
		G[i].PB(MP(i+1,0));
		G[i].PB(MP(i+1,POW[i-1]));
		m+=2;
	}
	if (L>POW[n-1]){
		int tmp=L-1;
		for (i=0;i<n-1;i++){
			if ((L-1)&(1<<i)){
				tmp^=(1<<i);
				G[i+1].PB(MP(n,tmp));
				m++;
			}
		}
		G[1].PB(MP(n,L-1)),m++;
	}
	printf("%d %d\n",n,m);
	for (i=1;i<=n;i++){
		for (j=0;j<(int)G[i].size();j++){
			int v=G[i][j].first,w=G[i][j].second;
			printf("%d %d %d\n",i,v,w);
		}
	}
	return 0;
}
```
