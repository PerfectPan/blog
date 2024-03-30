---
date: 2017-12-01
title: Wannafly 练习赛7 C 随机树
description: Wannafly 练习赛7 C 随机树
tag:
  - Segment Tree
  - Math
---

**题目链接**：[https://www.nowcoder.com/acm/contest/38/C](https://www.nowcoder.com/acm/contest/38/C)

**题意**：略。

**思路**：观察知，题目中给定了素因子的范围很小只有 $6$ 个，且由约数个数定理可以知道我们只要知道每个素因子的个数我们就可以知道约数的个数，所以有如下思路：首先把树转成 $DFS$ 序线性区间，然后开 $6$ 颗线段树维护每个位置每个素因子的个数，对于操作 $1$，即单点更新，乘 $x$ 就相当于把 $x$ 的每个素因子个数加到对应的位置上，对于操作 $2$，线段树成段查询素因子个数和就可以了，然后根据约数个数定理和唯一分解定理配合快速幂还原即可.

```cpp
#include <bits/stdc++.h>
#define lson root<<1,l,mid
#define rson root<<1|1,mid+1,r
using namespace std;
const int maxn=1e5+5;
const int P=1e9+7;
typedef long long ll;
int n,u,v,q,dfs_clock,id[maxn],L[maxn],R[maxn],in[maxn],a[maxn];
int primes[]={2,3,5,7,11,13};
int ans[6];
ll sum[maxn<<2][6];
char s[10];
vector<int>G[maxn];
void dfs(int u,int f){
    L[u]=++dfs_clock;
    id[dfs_clock]=u;
    for (int i=0;i<(int)G[u].size();i++){
        int v=G[u][i];
        if (v==f) continue;
        dfs(v,u);
    }
    R[u]=dfs_clock;
}
void pushup(int root){
    for (int i=0;i<6;i++) sum[root][i]=sum[root<<1][i]+sum[root<<1|1][i];
}
void build(int root,int l,int r){
    if (l==r){
        int tmp=a[id[l]];
        for (int i=0;i<6;i++){
            int cnt=0;
            if (tmp%primes[i]==0){
                while (tmp%primes[i]==0){
                    tmp/=primes[i];
                    cnt++;
                }
            }
            sum[root][i]=cnt;
        }
        return;
    }
    int mid=l+((r-l)>>1);
    build(lson);
    build(rson);
    pushup(root);
}
void query(int root,int l,int r,int L,int R){
    if (L<=l && r<=R){
        for (int i=0;i<6;i++){
            ans[i]+=sum[root][i];
        }
        return;
    }
    int mid=l+((r-l)>>1);
    if (L<=mid) query(lson,L,R);
    if (mid<R) query(rson,L,R);
    pushup(root);
    return;
}
void update(int root,int l,int r,int u,int v){
    if (l==r){
        int tmp=v;
        for (int i=0;i<6;i++){
            int cnt=0;
            if (tmp%primes[i]==0){
                while (tmp%primes[i]==0){
                    tmp/=primes[i];
                    cnt++;
                }
            }
            sum[root][i]+=cnt;
        }
        return;
    }
    int mid=l+((r-l)>>1);
    if (u<=mid) update(lson,u,v);
    else update(rson,u,v);
    pushup(root);
}
int ksm(int a,int n){
    int res=1;
    while (n){
        if (n&1) res=(1LL*res*a)%P;
        a=(1LL*a*a)%P;
        n>>=1;
    }
    return res;
}
int main(){
    scanf("%d",&n);
    for (int i=2;i<=n;i++){
        scanf("%d%d",&u,&v);
        u++,v++;
        G[u].push_back(v);
        in[v]++;
    }
    int f;
    for (int i=1;i<=n;i++) if (in[i]==0){
        f=i;
        break;
    }
    dfs(f,-1);
    for (int i=1;i<=n;i++) scanf("%d",&a[i]);
    build(1,1,n);
    for (scanf("%d",&q);q--;){
        scanf("%s",s);
        if (s[0]=='R'){
            int u;scanf("%d",&u);
            u++;
            memset(ans,0,sizeof(ans));
            query(1,1,n,L[u],R[u]);
            int a=1,num=1;
            for (int i=0;i<6;i++){
                a=1LL*a*(ans[i]+1)%P;
                num=1LL*num*ksm(primes[i],ans[i])%P;
            }
            printf("%d %d\n",num,a);
        }
        else{
            int u,x;scanf("%d%d",&u,&x);
            u++;
            update(1,1,n,L[u],x);
        }
    }
    return 0;
}

```
