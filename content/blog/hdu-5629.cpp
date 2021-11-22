---
date: 2018-05-08
title: HDUOJ 5629 Clarke and tree
description: HDUOJ 5629 Clarke and tree
tag:
  - DP 
  - Math
---

**题目链接**：[http://acm.hdu.edu.cn/showproblem.php?pid=5629](http://acm.hdu.edu.cn/showproblem.php?pid=5629)

**题意**：给定 $n$ 个节点还有每个节点最多的度数，问分别组成 $[1,n]$ 个节点的生成树的个数。

**思路**：结合 $prufer$ 序列可列出一个 $dp$ 方程，即 $dp[i][j][k]$ 表示前 $i$ 个点用了 $j$ 个且总度数为 $k$ 的方案数，那么答案就是 $dp[n][i][i-2]$，转移方程：$i$ 不选时 $dp[i][j][k]+=dp[i-1][j][k]$，$i$ 选时，枚举 $i$ 的度数 $d$ 则 $dp[i][j+1][k+d]+=\binom{k+d}{d}dp[i-1][j][k]$，时间复杂度 $O(n^4)$。

```cpp
#include <bits/stdc++.h>
using namespace std;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=50+2;
const int P=1000000007;
int T,i,j,k,l,n,a[N],f[N][N][N],C[N][N];
void up(int&a,int b){a+=b;if(a>=P)a-=P;}
void init(){
	for (int i=0;i<=50;i++){
		C[i][0]=1;
		for (int j=1;j<=i;j++){
			C[i][j]=C[i-1][j]+C[i-1][j-1];
			if (C[i][j]>=P) C[i][j]-=P;
		}
	}
}
int main(){
	init();
	for (read(T);T--;){
		read(n);
		for (i=1;i<=n;i++) read(a[i]);
		memset(f,0,sizeof(f));
		f[0][0][0]=1;
		for (i=1;i<=n;i++){
			for (j=0;j<i;j++){
				for (k=0;k<=n-2;k++){
					up(f[i][j][k],f[i-1][j][k]);
					for (l=0;l<a[i]&&k+l<=n-2;l++){
						up(f[i][j+1][k+l],1LL*C[k+l][l]*f[i-1][j][k]%P);
					}
				}
			}
		}
		printf("%d ",n);
		for (i=2;i<=n;i++) printf("%d%c",f[n][i][i-2],i==n?'\n':' ');
	}
	return 0;
}
```
