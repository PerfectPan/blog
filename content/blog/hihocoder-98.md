---
date: 2019-04-04

title: hihocoder [Offer收割]编程练习赛98 占领树节点

description: 占领树节点

tag:
	- Game Theory
---

**题目链接**：[http://hihocoder.com/contest/offers98/problem/4](http://hihocoder.com/contest/offers98/problem/4)

**题意**：略。

**思路**：假如先手选了一个点，那么后手肯定是在它选的点周围选一个点作为起始点，因为如果不是相邻的话，先手就可以先把它们之间的路先堵上，这是不优的，然后问题就转化成了树上选一个点，这个点相邻的点的最大子树大小（后手可占据的最多点数）是否小于 $n-$ 最大子树的大小（先手可占据的最少点数），如果满足的话这个点就可选，时间复杂度 $O(n)$。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0' || ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
int n,i,j,fa[N],sz[N];
vector<int>G[N],vec;
void dfs(int u,int f){
    sz[u]=1;
    int mx=0;
    for (int i=0;i<(int)G[u].size();++i){
        int v=G[u][i];
        if (v==f) continue;
        dfs(v,u);
        sz[u]+=sz[v];
        mx=max(mx,sz[v]); 
    }
    mx=max(mx,n-sz[u]);
    if (mx<n-mx) vec.PB(u);
}
int main(){
    read(n);
    for (i=1;i<=n;++i){
        read(fa[i]);
        if(fa[i]){
            G[fa[i]].PB(i);
            G[i].PB(fa[i]);
        }
    }
    dfs(1,0);
    sort(vec.begin(),vec.end());
    printf("%d\n",(int)vec.size());
    for (i=0;i<(int)vec.size();++i){
        printf("%d\n",vec[i]);
    }
    return 0;
}
```