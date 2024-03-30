---
date: 2018-05-25
title: 「CodePlus 2018 4 月赛」最短路
description: 「CodePlus 2018 4 月赛」最短路
tag:
  - Shortest Path
---

**题目链接**：[https://loj.ac/problem/6354](https://loj.ac/problem/6354)

**题意**：略。

**思路**：暴力连边 $n^2$ 直接炸了，不可取，考虑优化连边。由异或联想到二进制，注意到 $10101->10000$ 完全可以由 $10101->10001->10000$ 得到，也就是说 $10101->10000$ 这条边是完全没有必要的，也即我们只要每次枚举 $x$ 的二进制位 $i$，若 $i$ 这一位为 $1$ 则由 $x$ 向$x\oplus 2^i$ 连一条边权为 $2^i\times c$ 的双向边，那么 $x$ 到其他任意值的边权我们都可以通过这样的拆分得到了，然后跑下最短路就可以了，时间复杂度 $O((m+n\log n)\log n)$。

```cpp
#include <bits/stdc++.h>
#define PB push_back
#define MP make_pair
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
	while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
	return x=f?-x:x;
}
const int maxn=1e5+10;
const int INF=2000000000;
int n,m,i,j,c,u,v,w,s,t;
struct Edge{
    int from,to,dist;
};
struct HeapNode{
    int d,u;
    bool operator <(const HeapNode& rhs)const{
        return d>rhs.d;
    }
};
struct Dijkstra{
    int n,m;
    vector<Edge>edges;
    vector<int>G[maxn];
    bool done[maxn];
    int d[maxn];
    int p[maxn];

    void init(int n){
        this->n=n;
        for (int i=0;i<=n;i++) G[i].clear();
        edges.clear();
    }

    void AddEdge(int from,int to,int dist){
        edges.push_back((Edge){from,to,dist});
        m=edges.size();
        G[from].push_back(m-1);
    }

    void dijkstra(int s){
        priority_queue<HeapNode>Q;
        for (int i=0;i<=n;i++) d[i]=INF;
        d[s]=0;
        memset(done,false,sizeof(done));
        Q.push((HeapNode){0,s});
        while (!Q.empty()){
            HeapNode x=Q.top();Q.pop();
            int u=x.u;
            if (done[u]) continue;
            done[u]=true;
            for (int i=0;i<(int)G[u].size();i++){
                Edge &e=edges[G[u][i]];
                if (d[e.to]>d[u]+e.dist){
                    d[e.to]=d[u]+e.dist;
                    p[e.to]=G[u][i];
                    Q.push((HeapNode){d[e.to],e.to});
                }
            }
        }
    }
}solver;
int main(){
	read(n),read(m),read(c);
	solver.init(n);
	for (i=1;i<=m;i++){
		read(u),read(v),read(w);
		solver.AddEdge(u,v,w);
	}
	for (i=1;i<=n;i++){
		for (j=17;j>=0;j--){
			if (i&(1<<j)){
				solver.AddEdge(i,i^(1<<j),(1<<j)*c);
				solver.AddEdge(i^(1<<j),i,(1<<j)*c);
			}
		}
	}
	read(s),read(t);
	solver.dijkstra(s);
	printf("%d\n",solver.d[t]);
	return 0;
}
```
