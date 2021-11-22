---
date: 2018-09-14
title: CodeChef Danya and Numbers
description: CodeChef Danya and Numbers
tag:
  - Greedy
  - DP
  - Square Technique
---

**题目链接**：[https://www.codechef.com/problems/DANYANUM](https://www.codechef.com/problems/DANYANUM)

**题意**：[http://www.codechef.com/download/translated/COOK95/mandarin/DANYANUM.pdf](http://www.codechef.com/download/translated/COOK95/mandarin/DANYANUM.pdf)

**思路**：首先考虑没有删除插入，单单看询问 $3$，我们要怎么快速求？考虑对于一个答案，我们在集合中拿出来的数相与是这个数，说明我们拿出来的数都是这个答案的超集，所以直接高维前缀和预处理后即可 $O(1)$ 查询，只要这个答案的超集大于等于 $x$ 我们就可以找到这么一个方案。然后考虑如何确定最大的答案，直接按位从高到低贪心即可，这一位能选就选，最后的答案一定是最优的。接下来考虑带删除插入，如果每次插入删除就求一次高维前缀和肯定是不行的，所以我们需要稍微牺牲查询的时间，或者说尽量平衡查询和插入删除的时间，所以考虑对询问分块，每 $\sqrt n$ 次修改操作以后我们就重新求一遍高维前缀和，否则就拿一个队列存下当前修改的数以及是删除还是插入，用正负一来代表，这样询问的时候块内元素暴力遍历一遍即可，这样就平衡了复杂度，时间复杂度 $O(\sqrt m * k * 2^k+m* \sqrt m * k)$。

```cpp
#include <bits/stdc++.h>
using namespace std;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<'0' || ch>'9') f|=(ch=='-'),ch=getchar();
	while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
	return x=f?-x:x;
}
const int N=(1<<18)+10;
int n,m,k,i,sz,qsize,op,x,cnt[N],num[N],q[N],qval[N];
void SOS(){
	int i,status;
	for (i=0;i<(1<<k);++i) num[i]=cnt[i];
	for (i=0;i<k;++i){
		for (status=0;status<(1<<k);++status){
			if (!(status&(1<<i))) num[status]+=num[status|(1<<i)];
		}
	}
}
void add(int x){
	if (qsize>=sz){
		qsize=0;
		SOS();
	}
	cnt[x]++;
	q[qsize]=x;
	qval[qsize]=1;
	qsize++;
}
void del(int x){
	if (qsize>=sz){
		qsize=0;
		SOS();
	}
	cnt[x]--;
	q[qsize]=x;
	qval[qsize]=-1;
	qsize++;
}
int getNum(int status){
	int res=num[status],i;
	for (i=0;i<qsize;++i){
		if ((q[i]&status)==status) res+=qval[i];
	}
	return res;
}
int solve(int x){
	int res=0,i;
	for (i=18;i>=0;--i){
		if (getNum(res|(1<<i))>=x) res|=1<<i;
	}
	return res;
}
int main(){
	read(n),read(m),read(k);
	for (i=1;i<=n;++i){
		read(x);
		cnt[x]++;
	}
	SOS();
	sz=sqrt(m+0.5);
	for (;m--;){
		read(op),read(x);
		if (op==1) add(x);
		if (op==2) del(x);
		if (op==3) printf("%d\n",solve(x));
	}
	return 0;
}
```
