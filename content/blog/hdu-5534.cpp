---
date: 2017-09-12
title: HDUOJ 5534 Partial Tree
description: HDUOJ 5534 Partial Tree
tag:
  - DP
---

**题目链接**：[http://codeforces.com/problemset/problem/1149/B](http://codeforces.com/problemset/problem/1149/B)

**题意**：有 $n$ 个点要给他们连边组成一棵树，然后给你一个函数 $f(d)$ 表示度数为 $d$ 的点的价值，然后我们要求价值之和的最大值。

**思路**：首先观察发现一颗树如果节点为 $n$ 那么它的总度数一定为 $2*n-2$，然后问题就转化成了一个二维的完全背包问题，容量为总度数，物品重量代表度数，还要求恰好用 $n$ 个物品去填满，因为每个点度数至少要为 $1$ ，但这样复杂度是不能接受的，所以我们可以先假设每个点的度数为 $1$，算出当前价值，然后总度数就为 $n-2$，接下来就没有“恰好用 $n$ 个物品去填满”这个限制条件了，直接任意数量都可以，往 $n$ 个点的度数上加就可以了，这样就降了一维，直接完全背包去做就好了，但这里要注意就是价值要全部减去 $val[1]$ 表差值，而且每个物品的重量即度数也要相应减 $1$。

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
const int maxn=500000+5;
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
inline int add(int a,int b){return (a+=b)>=P?a-P:a;}
inline int sub(int a,int b){return (a-=b)<0?a+P:a;}
inline int mul(int a,int b){return 1LL*a*b%P;}
int T,n,V,dp[5000],val[2100];
int main(){
    for (scanf("%d",&T);T--;){
       scanf("%d",&n);
       for (int i=1;i<n;i++) scanf("%d",val+i);
       memset(dp,-1,sizeof(dp));
       dp[0]=n*val[1];
       for (int i=2;i<n;i++) val[i]-=val[1];
       V=n-2;
       for (int i=2;i<n;i++){
            for (int j=i-1;j<=V;j++)if(dp[j-i+1]!=-1){
                if (dp[j]!=-1) dp[j]=max(dp[j],dp[j-i+1]+val[i]);
                else dp[j]=dp[j-i+1]+val[i];
            }
       }
       printf("%d\n",dp[V]);
    }
    return 0;
}
```
