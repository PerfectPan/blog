---
date: 2018-03-04
title: Codeforces 444C DZY Loves Colors
description: Codeforces 444C DZY Loves Colors
tag:
  - Sqrt Algorithm
---

**题目链接**：[http://codeforces.com/problemset/problem/444/C](http://codeforces.com/problemset/problem/444/C)

**题意**：给定一个序列，$i$ 位置的颜色值是 $color_i$，有两个操作，操作一将 $[L,R]$ 内的颜色都修改为 $x$，同时对于位置 $i$，当它的颜色改为 $x$ 的时候，这个位置的价值增加 $|x-color_i|$，操作二询问区间 $[L,R]$ 的价值和。

**思路**：考虑到如果不断进行操作 $1$ 的话最后会变成一段段的颜色，那么我们进行分块，弄个标记维护块内是否颜色都一样，如果颜色都一样的话修改的时候直接整块打个标记即可，如果不一样则暴力修改，修改的时候对于不完整的块直接暴力修改，均摊下来时间复杂度不会很大，大概 $O(n\sqrt n)$。

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
const int N=1e5+10;
int n,m,sz,i,op,l,r,x,flag[N],block[N],color[N];
ll val[N],sum[N],tag[N];
#define umin(a,b) (a>b?b:a)
void reset(int x){
    if (flag[x]==-1) return;
    for (int i=(x-1)*sz+1;i<=umin(x*sz,n);i++){
        color[i]=flag[x];
    }
    flag[x]=-1;
}
void update(int a,int b,int x){
    int i,j;
    reset(block[a]);
    for (i=a;i<=umin(block[a]*sz,b);i++){
        val[i]+=abs(color[i]-x);
        sum[block[i]]+=abs(color[i]-x);
        color[i]=x;
    }
    if (block[a]!=block[b]){
        reset(block[b]);
        for (i=(block[b]-1)*sz+1;i<=b;i++){
            val[i]+=abs(color[i]-x);
            sum[block[i]]+=abs(color[i]-x);
            color[i]=x;
        }
    }
    for (i=block[a]+1;i<=block[b]-1;i++){
        if (flag[i]!=-1){
            tag[i]+=abs(flag[i]-x);
            flag[i]=x;
        }
        else{
            for (j=(i-1)*sz+1;j<=i*sz;j++){
                val[j]+=abs(color[j]-x);
                sum[i]+=abs(color[j]-x);
                color[j]=x;
            }
            flag[i]=x;
        }
    }
}
ll query(int a,int b){
    ll res=0,i;
    for (i=a;i<=umin(block[a]*sz,b);i++) res+=val[i]+tag[block[i]];
    if (block[a]!=block[b]){
        for (i=(block[b]-1)*sz+1;i<=b;i++) res+=val[i]+tag[block[i]];
    }
    for (i=block[a]+1;i<=block[b]-1;i++) res+=sum[i]+tag[i]*sz;
    return res;
}
int main(){
    read(n),read(m),sz=sqrt(n+0.5);
    for (i=1;i<=n;i++) color[i]=i,block[i]=(i-1)/sz+1,flag[block[i]]=-1;
    for (i=1;i<=m;i++){
        read(op),read(l),read(r);
        if (op==1){
            read(x);
            update(l,r,x);
        }
        else{
            printf("%lld\n",query(l,r));
        }
    }
    return 0;
}
```
