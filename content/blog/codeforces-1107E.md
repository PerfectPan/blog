---
date: 2019-01-30
title: Codeforces 1107E Vasya and Binary String
description: Codeforces 1107E Vasya and Binary String
tag:
  - DP
---

**题目链接**：[https://codeforces.com/problemset/problem/1107/E](https://codeforces.com/problemset/problem/1107/E)

**题意**：有一个 $01$ 字符串，告诉你消去连续一段相同字符的长度为 $x$ 价值 $val[x]$，求消掉这个字符串的最大价值。

**思路**：区间 $dp$，我们定义 $dp[l][r][k]$ 表示区间 $[l,r]$ 后面有 $k$ 个与 $s[r]$ 相同的字符下消去 $[l,r]$ 的最大价值，转移分两种，一种是这个 $k$ 个最后一个一起消掉了，那么

$$
dp[l][r][k]=max(dp[l][r]][k],dp[l][r-1][0]+val[k+1])
$$

否则我们让最后一个字符再跟 $[l,r-1]$ 的相同的字符一起连起来消掉，假设我们枚举的位置是 $i$，那么转移方程为

$$
dp[l][r][k]=max(dp[l][r][k],dp[l][i][k+1]+dp[i+1][r-1][0])
$$

时间复杂度 $O(n^4)$

```cpp
#include<bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0' || ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0'&& ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=100+10;
int n,i,a[N];
char s[N];
ll dp[N][N][N];
ll cal(int l,int r,int k){
	if (l>r) return 0;
	if (l==r) return a[k+1];
	if (~dp[l][r][k]) return dp[l][r][k];
	dp[l][r][k]=cal(l,r-1,0)+a[k+1];
	for (int i=l;i<r;++i){
		if (s[i]==s[r]){
			dp[l][r][k]=max(dp[l][r][k],cal(l,i,k+1)+cal(i+1,r-1,0));
		}
	}
	return dp[l][r][k];
}
int main(){
	memset(dp,-1,sizeof(dp));
	read(n);
	scanf("%s",s+1);
	for (i=1;i<=n;++i) read(a[i]);
	printf("%lld\n",cal(1,n,0));
	return 0;
}
```
