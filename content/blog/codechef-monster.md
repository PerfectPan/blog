---
date: 2018-09-14
title: CodeChef Killing Monsters
description: CodeChef Killing Monsters
tag:
  - Sqrt Algorithm
  - DP
---

**题目链接**：[https://www.codechef.com/problems/MONSTER](https://www.codechef.com/problems/MONSTER)

**题意**：[http://www.codechef.com/download/translated/JAN18/mandarin/MONSTER.pdf](http://www.codechef.com/download/translated/JAN18/mandarin/MONSTER.pdf)

**思路**：每次暴力算不可取，考虑将攻击一块块考虑，对于每一块我们计算出对每个怪兽的总的攻击量，这个直接高维前缀和即可求得，然后再遍历每个怪兽，如果这个怪兽还存活而且被击杀，我们就暴力遍历这个块找到是什么时候被击杀的，因为暴力遍历只会有 $n$ 次，每次遍历 $\sqrt n$ 的长度，所以时间复杂度是 $O(n\sqrt n)$ 的，而外部是一块块统计，每次遍历，所以时间复杂度大概是 $O(n\sqrt n \log n)$。

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
const int N=3e5+10;
struct Query{int x,y;}q[N];
ll h[N],f[N];
int n,i,j,k,mask,len,Q,sz,res[N],block[N];
void cal(int idx){
	int L=(idx-1)*sz+1,R=min(idx*sz,Q);
	for (int i=0;i<=mask;++i) f[i]=0;
	for (int i=L;i<=R;++i) f[q[i].x]+=q[i].y; 
	for (int i=0;i<len;++i){
		for (int status=0;status<(1<<len);++status){
			if (!(status&(1<<i))) f[status]+=f[status|(1<<i)];
		}
	}
}
int main(){
	read(n);
	for(mask=1;mask<n;mask<<=1)len++;mask--; 
	for (i=0;i<n;++i) read(h[i]);
	read(Q),sz=sqrt(Q+0.5);
	for (i=1;i<=Q;++i){
		read(q[i].x),read(q[i].y);
		q[i].x&=mask;
		block[i]=(i-1)/sz+1;
	}
	for (i=1;i<=(Q-1)/sz+1;++i){
		cal(i);
		for (j=0;j<n;++j)if(h[j]>0){
			h[j]-=f[j];
			if (h[j]<=0){
				h[j]+=f[j];
				for (k=(i-1)*sz+1;k<=min(i*sz,Q);++k){
					if ((j&q[k].x)==j){//careful
						h[j]-=q[k].y;
						if (h[j]<=0){
							res[k]++;
							break;
						}
					}
				}
			}
		}
	}
	for (i=1;i<=Q;++i){
		res[i]+=res[i-1];
		printf("%d\n",n-res[i]);
	}
	return 0;
}
```
