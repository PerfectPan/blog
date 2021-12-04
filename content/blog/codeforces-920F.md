---
date: 2018-02-05
title: Codeforces 920F SUM and REPLACE
description: Codeforces 920F SUM and REPLACE
tag:
  - Segment Tree
  - Math
---

**题目链接**：[http://codeforces.com/problemset/problem/920/F](http://codeforces.com/problemset/problem/920/F)

**题意**：给定序列支持两种操作，操作一：区间 $[L,R]$ 内所有数字替换成它们的约数个数，操作二:输出区间 $[L,R]$ 和。

**思路**：先用筛法把每个 $[1,1000000]$ 内所有数字的约数个数求出来，然后显然对于一个数最多经过 $6$ 次就变成 $2$ 或 $1$，所以我们建两棵线段树，一棵维护区间和，一棵维护区间最值，对于操作一我们线段树往下找的时候如果区间最值大于 $2$ 的话就往下搜，然后暴力更新，操作二就是常规的线段树求区间和。

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
#define pb push_back
#define mp make_pair
#define ALL(x) x.begin(),x.end()
#define F first
#define S second
using namespace std;
typedef long long ll;
const int maxn=1e6+5;
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
template <class T1, class T2>inline void gmax(T1 &a,T2 b){if (b>a) a=b;}
template <class T1, class T2>inline void gmin(T1 &a,T2 b){if (b<a) a=b;}
void up(int&x,int y){x+=y;if(x>=P)x-=P;}
const int N=300000+10;
int n,m,i,j,op,l,r,sz,v[N],D[maxn],mx[N<<2];
ll sum[N<<2];
#define umax(a,b) (a<b?b:a)
void gmax(int&a,int b){if(a<b)a=b;}
void pushup(int root){
    sum[root]=sum[root<<1]+sum[root<<1|1];
    mx[root]=umax(mx[root<<1],mx[root<<1|1]);
}
void build(int root,int l,int r){
    if (l==r){
        sum[root]=read(mx[root]);
        return;
    }
    int mid=l+((r-l)>>1);
    build(lson);
    build(rson);
    pushup(root);
}
void update(int root,int l,int r,int L,int R){
    if (L<=l && r<=R && mx[root]<=2) return;
    if (l==r){
        sum[root]=mx[root]=D[sum[root]];
        return;
    }
    int mid=l+((r-l)>>1);
    if (L<=mid) update(lson,L,R);
    if (mid<R) update(rson,L,R);
    pushup(root);
}
ll query_sum(int root,int l,int r,int L,int R){
    if (L<=l && r<=R) return sum[root];
    int mid=l+((r-l)>>1);
    ll res=0;
    if (L<=mid) res+=query_sum(lson,L,R);
    if (mid<R) res+=query_sum(rson,L,R);
    return res;
}
int main(){
    for (i=1;i<=1e6;i++){
        for (j=i;j<=1e6;j+=i){
            D[j]++;
        }
    }
    read(n),read(m);
    build(1,1,n);
    for (i=1;i<=m;i++){
        read(op),read(l),read(r);
        if (op==2) printf("%lld\n",query_sum(1,1,n,l,r));
        else if (mx[1]>2){
            update(1,1,n,l,r);
        }
    }
    return 0;
}
```
