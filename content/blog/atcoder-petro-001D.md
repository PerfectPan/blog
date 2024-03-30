---
date: 2018-02-04
title: CodeChef April Challenge 2019 Kira Loves Palindromes
description: CodeChef April Challenge 2019 Kira Loves Palindromes
tag:
  - Graph Theory
  - Greedy
---

**题目链接**：[https://apc001.contest.atcoder.jp/tasks/apc001_d](https://apc001.contest.atcoder.jp/tasks/apc001_d)

**题意**：给你一片森林，$n$ 个点，$m$ 条边，每个节点都有自己的价值 $a_i$，你可以进行若干次操作，每次操作取两个点连一条边，代价是两个点的价值和，且用完以后这两个点就不能再用了，问最小的代价是多少能使整片森林都连接起来，如果不行就输出 $Impossible$。

**思路**: 我们可以认定一开始有 $n$ 个连通块，连了 $m$ 条边后，连通块减少为 $n-m$，那么我们应该最少再连 $n-m-1$ 条边使得整片森林连通，而这需要 $2\times (n-m-1)$ 个顶点，所以如果 $n$ 小于 $2 \times(n-m-1)$ 无疑是没有解的。若有解，我们先在 $n-m$ 个连通块里各选一个价值最小的顶点，保证最后都能连到，那么剩下 $n-m-2$ 个顶点我们只要从小到大的挑就可以了，因为不管怎么样这 $n-m-2$ 个顶点我们总能找到对应的不跟他在一个连通块里的顶点进行连边（有点像二分图连边，自己画画大概就明白了），这样就解决了。

```cpp
const int N=100000+10;
int n,m,i,j,x,y,sz,cnt;
ll a[N],ans;
vector<int>G[N],v[N],res;
bool vis[N];
void dfs(int x){
    vis[x]=true;
    v[cnt].pb(a[x]);
    for (int i=0;i<(int)G[x].size();i++){
        int u=G[x][i];
        if (!vis[u]) dfs(u);
    }
}
int main(){
    sz=read(n),read(m);
    for (i=1;i<=n;i++){
        read(a[i]);
    }
    for (i=1;i<=m;i++){
        read(x),read(y);
        x++,y++;
        G[x].pb(y);
        G[y].pb(x);
    }
    if (n<2*(n-m-1)) return puts("Impossible"),0;
    for (i=1;i<=n;i++)if(!vis[i]){
        cnt++;
        dfs(i);
        sort(ALL(v[cnt]));
        ans+=v[cnt][0];
        for (j=1;j<(int)v[cnt].size();j++) res.pb(v[cnt][j]);
    }
    if (cnt==1) return puts("0"),0;
    sz=n-m;
    sort(ALL(res));
    for (i=0;i<sz-2;i++) ans+=res[i];
    printf("%lld\n",ans);
    return 0;
}

```
