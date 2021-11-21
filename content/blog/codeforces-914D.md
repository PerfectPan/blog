---
date: 2018-03-04
title: Codeforces 914D Bash and a Tough Math Puzzle
description: Codeforces 914D Bash and a Tough Math Puzzle
tag:
  - Segment Tree
---

**题目链接**：[http://codeforces.com/problemset/problem/914/D](http://codeforces.com/problemset/problem/914/D)

**题意**:给一个序列，支持两个操作，一个操作是单点修改，另一个操作是询问区间 $[L,R]$ 是否能通过修改至多一个点的值使区间的 $GCD==x$。

**思路**：线段树维护区间 $gcd$。如果区间 $gcd$ 为 $x$，有个前提条件是区间内每个数都可以表示成 $x * k$ 的形式，$k$ 为任意正整数，若满足最多有一个不是 $x$ 的倍数的话，我们就可以直接把那个不是 $x$ 的倍数直接改成 $x$ 就可以保证最后区间 $gcd$ 为 $x$ 了，所以我们在线段树上搜索找区间 $[L,R]$ 内不是 $x$ 倍数的数的个数，如果当前节点 $gcd$ 值是 $x$ 的倍数则没有必要往下搜索，直接返回，若最后答案小于等于 $1$，则满足条件。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
using namespace std;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=5e5+10;
int n,i,op,l,r,q,x,g[N<<2];
#define lson root<<1,l,mid
#define rson root<<1|1,mid+1,r
void pushup(int root){g[root]=__gcd(g[root<<1],g[root<<1|1]);}
void build(int root,int l,int r){
    if (l==r){
        read(g[root]);
        return;
    }
    int mid=l+((r-l)>>1);
    build(lson);
    build(rson);
    pushup(root);
}
void update(int root,int l,int r,int x,int v){
    if (l==r){
        g[root]=v;
        return;
    }
    int mid=l+((r-l)>>1);
    if (x<=mid) update(lson,x,v);
    else update(rson,x,v);
    pushup(root);
}
void query(int root,int l,int r,int L,int R,int x,int&res){
    if (res>=2) return;
    if (l==r){
        if (g[root]%x!=0) res++;
        return;
    }
    int mid=l+((r-l)>>1);
    if (L<=l&&r<=R){
        if (g[root<<1]%x!=0) query(lson,L,R,x,res);
        if (g[root<<1|1]%x!=0) query(rson,L,R,x,res);
        return;
    }
    if (L<=mid) query(lson,L,R,x,res);
    if (mid<R) query(rson,L,R,x,res);
}
int main(){
    read(n);
    build(1,1,n);
    for (read(q);q--;){
        read(op),read(l),read(r);
        if (op==1){
            read(x);
            int res=0;
            query(1,1,n,l,r,x,res);
            if (res>1) puts("NO");
            else puts("YES");
        }
        else update(1,1,n,l,r);
    }
    return 0;
}

```
