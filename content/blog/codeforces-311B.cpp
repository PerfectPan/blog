---
date: 2019-04-12
title: Codeforces 311B Cats Transport
description: Codeforces 311B Cats Transport
tag:
  - DP
---

**题目链接**：[http://codeforces.com/contest/311/problem/B](http://codeforces.com/contest/311/problem/B)

**题意**：$m$ 只猫，放在 $[1,n]$ 中的一个位置 $h_i$，且到 $t_i$ 以后才能被接走，每个位置之间的距离 $d_i$ 已知，现在你可以规划 $p$ 个人任意时间从 $1$ 号位置开始走，移动速度是一个单位，要求接走所有的猫，最小化猫等待的时间，人出发的时间可以为负数。

**思路**：对于每只猫，设 $a_i=t_i-\sum_{j=1}^{h_i}$，一个人如果想接到这只猫，就必须在 $a_i$ 以后出发，假设出发时间为 $t$，则这只猫的等待时间就是 $t-a_i$。我们将 $a_i$ 排序，则每个人带走的猫一定是排序后连续的一段，则我们可以根据这个列出方程，设 $dp[i][j]$ 为前 $i$ 个人带走前 $j$ 只猫，猫等待时间最小的总和，假设第 $i$ 个人带走 $[k+1,j]$ 的猫，那么这个人出发的最早时间就是 $a_j$，这些猫等待时间之和为 $\sum_{p=k+1}^{j}(a_j-a_p)=a_j\times (j-k)-(S_j-S_k)$, $S_k$ 为 $a$ 数组的前缀和，最后状态转移方程就是

$$
dp[i][j]=min(dp[i-1][k]+a_j\times (j-k)-(S_j-S_k))
$$

直接转移是 $O(pm^2)$ 的，需要优化，我们把 $min$ 去掉，式子做下变换得，

$$
dp[i-1][k]+S_k=a_j\times k+dp[i][j]-a_j\times j
$$

以 $k$ 为横坐标，$dp[i-1][k]+S_k$ 为纵坐标建立平面直角坐标系，上式就是一条以 $a_j$ 为斜率，$dp[i][j]-a_j\times j$ 为截距的直线，当截距最小化的时候 $dp[i][j]$ 取到最小值，应该维护一个下凸壳，因为直线斜率单调递增，且决策点横坐标也是单调递增，直接单调队列维护决策点即可，时间复杂度 $O(pm)$。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0' || ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
int n,m,p,l,r,h,t,i,j,q[N];
ll d[N],a[N],S[N],dp[105][N];
inline ll getAns(int i,int j,int k){return dp[i-1][k]+a[j]*(j-k)-(S[j]-S[k]);}
inline ll getY(int i,int k){return dp[i-1][k]+S[k];}
int main(){
	read(n),read(m),read(p);
	for (i=2;i<=n;++i){
		read(d[i]);
		d[i]+=d[i-1];
	}
	for (i=1;i<=m;++i){
		read(h),read(t);
		a[i]=t-d[h];
	}
	sort(a+1,a+1+m);
	for (i=1;i<=m;++i) S[i]=S[i-1]+a[i];
	memset(dp,0x3f,sizeof(dp));
	for (dp[0][0]=0,i=1;i<=p;++i){
		q[l=r=1]=0;
		for (j=1;j<=m;++j){
			while (l<r && getY(i,q[l+1])-getY(i,q[l])<=a[j]*(q[l+1]-q[l])) l++;
			dp[i][j]=min(dp[i-1][j],getAns(i,j,q[l]));
			while (l<r && (getY(i,q[r])-getY(i,q[r-1]))*(j-q[r])>=(getY(i,j)-getY(i,q[r]))*(q[r]-q[r-1])) r--;
			q[++r]=j;
		}
	}
	printf("%lld\n",dp[p][m]);
	return 0;
}
```
