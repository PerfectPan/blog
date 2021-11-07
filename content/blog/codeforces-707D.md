---
date: 2018-10-19
title: Codeforces 707D Persistent Bookcase
description: Codeforces 707D Persistent Bookcase
tag:
  - Bitmasks
---

**题目链接**：[http://codeforces.com/contest/707/problem/D](http://codeforces.com/contest/707/problem/D)

**题意**：$1.(x,y)$ 置 $1$; $2.(x,y)$ 置 $0$; $3.$ 第 $x$ 行按位取反; $4.$ 退回到第 $k$ 个操作时的样子，每次操作完以后输出棋盘上 $1$ 的个数。

**思路**：好题，离线思路很妙，把每个操作看成一个树上的节点，如果我第 $i$ 个操作是要退回到第 $k$ 个操作，那就 $k->i$，否则就是 $i-1->i$，然后这就成了一个树的形状，我们直接在树上 $dfs$，回溯的时候撤销操作即可，这样就解决了可持久化的问题，然后翻转什么的用 $bitset$ 加速即可。

```cpp
#include<bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0' || ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0'&& ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
struct Node{int tp,x,y;}t[N];
bitset<1005>maze[1005];
int n,m,q,i,j,num,ans[N];
vector<int>G[N];
void deal(int o,int& vaild){
	int k=t[o].tp,x=t[o].x,y=t[o].y;
	if (k==1){
		if (!maze[x][y]) maze[x][y]=1,num++,vaild=1;
		else vaild=0;
	}
	if (k==2){
		if (maze[x][y]) maze[x][y]=0,num--,vaild=1;
		else vaild=0;
	}
	if (k==3){
		int cnt=maze[x].count();
		if (maze[x][1004]==1) cnt-=(1005-m);
		num=num-cnt+(m-cnt);
		maze[x]=~maze[x];
	}
}
void cancel(int o,int&vaild){
	int k=t[o].tp,x=t[o].x,y=t[o].y;
	if (k==1){
		if (vaild) maze[x][y]=0,num--;
	}
	if (k==2){
		if (vaild) maze[x][y]=1,num++;
	}
	if (k==3){
		int cnt=maze[x].count();
		if (maze[x][1004]==1) cnt-=(1005-m);
		num=num-cnt+(m-cnt);
		maze[x]=~maze[x];
	}
}
void dfs(int x){
	int vaild;
	if (x) deal(x,vaild),ans[x]=num;
	for (int i=0;i<(int)G[x].size();++i){
		int v=G[x][i];
		dfs(v);
	}
	if (x) cancel(x,vaild);
}
int main(){
	read(n),read(m),read(q);
	for (i=1;i<=q;++i){
		read(t[i].tp);
		if (t[i].tp<=2) read(t[i].x),read(t[i].y);
		else read(t[i].x);
	}
	G[0].PB(1);
	for (i=2;i<=q;++i){
		if (t[i].tp<4) G[i-1].PB(i);
		else G[t[i].x].PB(i);
	}
	dfs(0);
	for (i=1;i<=q;++i) printf("%d\n",ans[i]);
	return 0;
}
```
