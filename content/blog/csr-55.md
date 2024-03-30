---
date: 2017-11-02
title: CSAcademy Round#55 Black White Tree
description: CSAcademy Round#55 Black White Tree
tag:
  - DP
---

**题目链接**：[https://csacademy.com/contest/round-55/task/black-white-tree/](https://csacademy.com/contest/round-55/task/black-white-tree/)

**题意**：给定一棵树，对节点进行黑白染色，然后给出两个操作，操作 $1$ 是将指定节点的颜色取反，黑的染成白的，白的染成黑的，操作 $2$ 是查询整棵树中所有与该节点相同颜色的距离之和。

**思路**：其实自己还是云里雾里的，对于这题的分块还是不太懂复杂度怎么算的。。不过还是有所收获，对树形 $DP$ 的一个套路又加深了印象，抛开两个操作，直接求每个节点与其他所有节点的距离和 $ans_i$ 要用到树形 $DP$，$DFS$ 以任意节点为根节点搜一下求出以每个节点为根节点的子树里节点到该节点的路径和 $sum_i$ 及节点数量 $cnt_i$，那么对于根节点的其他所有节点到该节点的距离和无疑就是 $sum_r$，然后对于它的相邻节点，我们可以很容易通过现有的东西 $O(1)$ 推算出相邻节点的值。$O(n)$ 的复杂度即可求出答案，那么回到这个问题，无疑就是记录以这个节点为根的黑色节点数量和白色节点数量，还有它们到根节点的距离和即可求出我们要的答案。接下来就是玄学部分了...自己也不是很懂，大概就是 $sqrt(Q)$ 为一个整体做一次树形 $DP$，然后里面乱搞...复杂度也不会算...太菜了...以后再回来回顾吧...

```cpp
#pragma comment(linker, "/STACK:102400000,102400000")
#include <map>
#include <set>
#include <stack>
#include <queue>
#include <cmath>
#include <string>
#include <vector>
#include <cstdio>
#include <cctype>
#include <cstring>
#include <sstream>
#include <cstdlib>
#include <iostream>
#include <algorithm>
#define lson root<<1,l,mid
#define rson root<<1|1,mid+1,r
#define Key_Value ch[ch[root][1]][0]
#define DBN1(a)           cerr<<#a<<"="<<(a)<<"\n"
#define DBN2(a,b)         cerr<<#a<<"="<<(a)<<", "<<#b<<"="<<(b)<<"\n"
#define DBN3(a,b,c)       cerr<<#a<<"="<<(a)<<", "<<#b<<"="<<(b)<<", "<<#c<<"="<<(c)<<"\n"
#define DBN4(a,b,c,d)     cerr<<#a<<"="<<(a)<<", "<<#b<<"="<<(b)<<", "<<#c<<"="<<(c)<<", "<<#d<<"="<<(d)<<"\n"
#define DBN5(a,b,c,d,e)   cerr<<#a<<"="<<(a)<<", "<<#b<<"="<<(b)<<", "<<#c<<"="<<(c)<<", "<<#d<<"="<<(d)<<", "<<#e<<"="<<(e)<<"\n"
#define DBN6(a,b,c,d,e,f) cerr<<#a<<"="<<(a)<<", "<<#b<<"="<<(b)<<", "<<#c<<"="<<(c)<<", "<<#d<<"="<<(d)<<", "<<#e<<"="<<(e)<<", "<<#f<<"="<<(f)<<"\n"
#define clr(a,x) memset(a,x,sizeof(a))
using namespace std;
typedef long long ll;
const int magic=210;
const int maxn=50000+5;
const int INF=0x3f3f3f3f;
const int P=1000000007;
const double PI=acos(-1.0);
template<typename T>
inline T read(T&x){
    x=0;int _f=0;char ch=getchar();
    while(ch<'0'||ch>'9')_f|=(ch=='-'),ch=getchar();
    while(ch>='0'&&ch<='9')x=x*10+ch-'0',ch=getchar();
    return x=_f?-x:x;
}
int n,m;
set<int>q;
int d[maxn],col[maxn],parent[maxn][17],cnt[maxn][2],sum[maxn][2];
vector<int>G[maxn];
void dfs(int u,int f){
    parent[u][0]=f;
    for (int i=1;(1<<i)<=d[u];i++) parent[u][i]=parent[parent[u][i-1]][i-1];
    for (auto v:G[u]){
        if (v==f) continue;
        d[v]=d[u]+1;
        parent[v][0]=u;
        dfs(v,u);
    }
}
int lca(int u,int v){
    if (d[u]>d[v]) swap(u,v);
    for (int k=0;k<17;k++){
        if (((d[v]-d[u])>>k)&1) v=parent[v][k];
    }
    if (u==v) return u;
    for (int k=16;k>=0;k--){
        if (parent[u][k]!=parent[v][k]){
            u=parent[u][k];
            v=parent[v][k];
        }
    }
    return parent[u][0];
}
int dist(int x,int y){return d[x]+d[y]-2*d[lca(x,y)];}
void dfs1(int u,int f){
	for(auto &v:G[u]){
		if(v==f)continue;
		dfs1(v,u);
		cnt[u][0]+=cnt[v][0];
		cnt[u][1]+=cnt[v][1];
		sum[u][0]+=sum[v][0]+cnt[v][0];
		sum[u][1]+=sum[v][1]+cnt[v][1];
	}
	cnt[u][col[u]]++;
}
void dfs2(int u,int f){
    if (u!=1){
        int cnty0=cnt[f][0]-cnt[u][0];
        int cnty1=cnt[f][1]-cnt[u][1];
        int sumy0=sum[f][0]-(sum[u][0]+cnt[u][0]);
        int sumy1=sum[f][1]-(sum[u][1]+cnt[u][1]);
        cnt[u][0]+=cnty0;
        cnt[u][1]+=cnty1;
        sum[u][0]+=sumy0+cnty0;
        sum[u][1]+=sumy1+cnty1;
    }
    for(auto v:G[u]){
        if (v==f) continue;
        dfs2(v,u);
    }
}
void build(){
    memset(cnt,0,sizeof(cnt));
    memset(sum,0,sizeof(sum));
    dfs1(1,1);
    dfs2(1,1);
}
int main(){
    read(n),read(m);
    for (int i=1;i<=n;i++) read(col[i]);
    for (int i=1;i<n;i++){
        int u,v;read(u),read(v);
        G[u].push_back(v);
        G[v].push_back(u);
    }
    dfs(1,1);
    build();
    for(;m--;){
        int t,x;
        read(t),read(x);
        if (t==1){
            if (q.count(x)) q.erase(x);
            else q.insert(x);
            if (q.size()>=magic){
                for (auto& itr:q){
                    col[itr]=!col[itr];
                }
                build();
                q.clear();
            }
        }
        else{
            int colx=col[x];
            if (q.count(x)) colx=!col[x];
            int res=sum[x][colx];
            for (auto& itr:q){
                if (colx==!col[itr]) res+=dist(x,itr);
                else res-=dist(x,itr);
            }
            printf("%d\n",res);
        }
    }
    return 0;
}
```
