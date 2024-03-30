---
date: 2019-03-20
title: Codeforces 1141G Privatization of Roads in Treeland
description: Codeforces 1141G Privatization of Roads in Treeland
tag:
  - Greedy
---

**题目链接**：[http://codeforces.com/problemset/problem/1141/G](http://codeforces.com/problemset/problem/1141/G)

**题意**：给定一个 $n$ 个点的无根树，现给这个树的边进行染色。定义一个节点是坏点，若满足与该节点相连的至少两条边是相同的颜色，求至多有 $k$ 个坏点的情况下最少需要几种颜色才能进行合法染色。

**思路**：考虑一个点不是坏点的情况，必须满足与之相连的每条边颜色均不同，设最多的点的度数为 $D$。若一个坏点也没有，那么最少肯定需要 $D$ 种颜色，若允许有 $k$ 个坏点，则意味着度数第 $k+1$ 大的节点相连的每条边必须颜色均不同，即：答案为第 $k+1$ 大点的度数。染色直接 $dfs$ 染色即可。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while(ch<'0'||ch>'9')f|=(ch=='-'),ch=getchar();
    while(ch>='0'&&ch<='9')x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=2e5+10;
vector<pair<int,int> >G[N];
int n,k,u,v,i,ans,deg[N],col[N];
void dfs(int u,int f,int c){
	for (int i=0;i<(int)G[u].size();++i){
		int v=G[u][i].first,id=G[u][i].second;
		if (v==f) continue;
		col[id]=c;
		(c+=1)%=ans;
		dfs(v,u,c);
	}
}
int main(){
	read(n),read(k);
	for (i=1;i<n;++i){
		read(u),read(v);
		G[u].push_back(make_pair(v,i));
		G[v].push_back(make_pair(u,i));
		deg[u]+=1,deg[v]+=1;
	}
	sort(deg+1,deg+1+n);
	reverse(deg+1,deg+1+n);
	ans=deg[k+1];
	dfs(1,0,0);
	printf("%d\n",ans);
	for (i=1;i<n;++i){
		printf("%d%c",col[i]+1,i==n-1?'\n':' ');
	}
	return 0;
}
```