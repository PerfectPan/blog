---
date: 2018-02-07
title: Codeforces 834D The Bakery
description: Codeforces 834D The Bakery
tag:
  - Segment Tree
  - DP
---

**题目链接**：[http://codeforces.com/problemset/problem/834/D](http://codeforces.com/problemset/problem/834/D)

**题意**：给定一个序列，将其划分成 $K$ 段，一段的价值是数的种类，求最大价值。

**思路了**：先列出个显然的 $DP$ 方程，$dp[i][j]=max(dp[k-1][j-1]+val[k][i])$，$dp[i][j]$ 表示前 $i$ 个数划分成 $j$ 段的最大价值，则我们最终要的答案就是 $dp[n][k]$，暴力转移 $O(kn^2)$ 肯定 $TLE$，所以要想想优化。考虑到从 $i->i+1$ 最多只改变一段的价值，所以我们先预处理出这个位置的数之前出现的位置，设为 $k$，那么我们只要更新 $[k+1,i+1]$ 这一段的值就可以了。每次决策时，建立线段树维护上一次决策 $dp$ 价值的最大值，位置 $i$ 存的是 $dp[i-1][j-1]$。然后从 $i->i+1$ 的时候区间更新 $[pre[v[i+1]]+1,i+1]$，这时候显然 $dp[k-1][j-1]$ 的值变成了 $dp[k-1][j-1]+val[k][i]$，查询前缀最值更新答案就可以了，时间复杂度 $O(nklogn)$。

```cpp
const int N=35000+10;
int n,k,i,j,a[N],last[N],pre[N],dp[N][55],mx[N<<2],tag[N<<2];
void pushup(int root){mx[root]=max(mx[root<<1],mx[root<<1|1]);}
void pushdown(int root){
    if (tag[root]){
        mx[root<<1]+=tag[root];
        mx[root<<1|1]+=tag[root];
        tag[root<<1]+=tag[root];
        tag[root<<1|1]+=tag[root];
        tag[root]=0;
    }
}
void build(int root,int l,int r,int index){
    tag[root]=0;
    if (l==r){
        mx[root]=dp[l-1][index];
        return;
    }
    int mid=l+((r-l)>>1);
    build(lson,index);
    build(rson,index);
    pushup(root);
}
void update(int root,int l,int r,int L,int R){
    if (L<=l && r<=R){
        mx[root]++;
        tag[root]++;
        return;
    }
    pushdown(root);
    int mid=l+((r-l)>>1);
    if (L<=mid) update(lson,L,R);
    if (mid<R) update(rson,L,R);
    pushup(root);
}
int query(int root,int l,int r,int L,int R){
    if (L<=l && r<=R) return mx[root];
    pushdown(root);
    int mid=l+((r-l)>>1);
    int ret=0;
    if (L<=mid) ret=max(ret,query(lson,L,R));
    if (mid<R) ret=max(ret,query(rson,L,R));
    pushup(root);
    return ret;
}
int main(){
    read(n),read(k);
    for (i=1;i<=n;i++){
        read(a[i]);
        last[i]=pre[a[i]],pre[a[i]]=i;
    }
    for (i=1;i<=k;i++){
        build(1,1,n,i-1);
        for (j=1;j<=n;j++){
            update(1,1,n,last[j]+1,j);
            dp[j][i]=query(1,1,n,1,j);
        }
    }
    printf("%d\n",dp[n][k]);
    return 0;
}
```
