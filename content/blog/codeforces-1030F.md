---
date: 2018-09-26
title: Codeforces 1030F Putting Boxes Together
description: Codeforces 1030F Putting Boxes Together
tag:
  - Segment Tree
---

**题目链接**：[http://codeforces.com/problemset/problem/1030/F](http://codeforces.com/problemset/problem/1030/F)

**题意**：有 $n$ 个物品，告诉你每个物品的位置 $a_i$ 和质量 $w_i$，它每次移动到旁边相邻的没有被占的位置消耗的能量为 $w_i$，现在有 $q$ 次操作，操作 $1$：单点修改下标 $i$ 的质量 $w_i$,操作 $2$:区间询问 $[l,r]$,将下标 $[L,R]$ 的物品移到连续的一段位置上所消耗的最少的能量是多少，即全部移动到 $[x,x+(R-L)]$。

**思路**：对于操作 $2$，我们要做的就是求 $min(\sum_{i=L}^{R}w_i\left |a_i-(x+i-L+1)\right |)$，稍微变一下得到:

$$
min(\sum_{i=L}^{R}w_i\left |(a_i-i)-(x-L+1)|\right )
$$

问题就转化成了带权中位数的问题，我们拿树状数组维护 $w_i(a_i-i)$ 和 $w_i$ 的的和，查询的时候用求带权中位数的方法去二分然后算贡献即可，时间复杂度 $O(n+q\log^2n)$,据说树状数组查询可以优化到 $\log n$，不过我还不会，只会拿可持久化线段树把查询复杂度优化到 $\log n$。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<'0' || ch>'9') f|=(ch=='-'),ch=getchar();
	while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
	return x=f?-x:x;
}
const int N=2e5+10;
const int P=1e9+7;
int n,q,i,x,y,a[N],w[N],pres[N],sum2[N];
ll sum[N],prew[N];
inline void up(int&a,int b){a+=b;if(a>=P)a-=P;}
inline int lowbit(int x){return x&(-x);}
void add1(int x,int val){for(;x<=n;x+=lowbit(x))sum[x]+=val;}
void add2(int x,int val){for(;x<=n;x+=lowbit(x))up(sum2[x],val);}
ll get1(int x){
	ll res=0;
	for (;x>0;x-=lowbit(x)) res+=sum[x];
	return res;
}
int get2(int x){
	int res=0;
	for (;x>0;x-=lowbit(x)) up(res,sum2[x]);
	return res;
}
void revise(int pos,int nw){
	add1(pos,-w[pos]);
	add2(pos,(-1LL*w[pos]*a[pos]%P+P)%P);
	w[pos]=nw;
	add1(pos,w[pos]);
	add2(pos,(1LL*w[pos]*a[pos]%P+P)%P);
}
void work(int L,int R){
	ll t=get1(L-1);
	ll tot=get1(R)-get1(L-1);
	int l=L,r=R,pos=R;
	while (l<=r){
		int mid=l+((r-l)>>1);
		ll v=get1(mid)-t;
		if (v*2LL>=tot){
			r=mid-1;
			pos=mid;
		}
		else l=mid+1;
	}
	ll A=get2(pos)-get2(L-1);
	ll B=get2(R)-get2(pos);
	ll C=-1LL*a[pos]*((get1(pos)-t)%P)%P;
	ll D=-1LL*a[pos]*((get1(R)-get1(pos))%P)%P;
	ll res=(B+D-A-C)%P;
	if (res<0) res+=P;
	printf("%lld\n",res);
}
int main(){
	read(n),read(q);
	for (i=1;i<=n;++i){
		read(a[i]);
		a[i]-=i;
	}
	for (i=1;i<=n;++i){
		read(w[i]);
		prew[i]=prew[i-1]+w[i];
		sum[i]=prew[i]-prew[i-lowbit(i)];
	
		pres[i]=(pres[i-1]+1LL*a[i]*w[i]%P)%P;
		if (pres[i]<0) pres[i]+=P;
		sum2[i]=pres[i]-pres[i-lowbit(i)];
		if (sum2[i]<0) sum2[i]+=P;
	}
	for (;q--;){
		read(x),read(y);
		if (x<0) revise(-x,y);
		else work(x,y);
	}
	return 0;
}
```
