---
date: 2019-03-20
title: Codeforces 1140E Palindrome-less Arrays
description: Codeforces 1140E Palindrome-less Arrays
tag:
  - DP
---

**题目链接**：[http://codeforces.com/problemset/problem/1140/E](http://codeforces.com/problemset/problem/1140/E)

**题意**：给你一个串，这个串有 $-1$ 或 $[1,k]$ 中的数组成，$-1$ 位置的数未确定，你可以将 $[1,k]$ 中的数填入其中，问有多少种填的方案使得这个串中不包含回文串。

**思路**：有一个性质是只要长度为$3$的回文串没有出现那么其他奇数长度的回文串一定不会出现，所以问题就规约到了如何填保证不出现长度为$3$的回文串，而长度为 $3$ 的回文串又有一个性质是 $a[i]==a[i+2]$，所以奇数位置和偶数位置是互不影响的，我们可以把奇数和偶数位置分别处理，问题有规约成了给你个数组，保证相邻两数不同的填法有多少种。我们定义 $dp[i][0/1]$ 表示有连续 $i$ 个 $-1$ 左右两边字符相等/不相等的方案数，转移方程为 

$$
dp[i][0]=(k-1)dp[i-1][1]
$$ 

$$
dp[i][1]=dp[i-1][0]+(k-2)*dp[i-1][1]
$$

，初始值为 $dp[0][0]=0$(相邻字符不能相等，所以为 $0$)，$dp[0][1]=1$。最后答案就是取出数组连续的 $-1$ 提出来用预处理好的 $dp$ 数组根据乘法原理乘起来就好了，首尾的连续段要特殊处理。

```cpp
#include <bits/stdc++.h>
#define PB emplace_back
#define MP make_pair
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<'0'||ch>'9') f|=ch=='-',ch=getchar();
	while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
	return x=f?-x:x;
}
const int N=2e5+10;
const int P=998244353;
int n,k,i,j,x,a[N],b[N],dp[N][2];
inline void up(int&a,int b){a+=b;if(a>=P)a-=P;}
int fexp(int a,int n){
	int res=1;
	while (n){
		if (n&1) res=1LL*res*a%P;
		a=1LL*a*a%P;
		n>>=1;
	}
	return res;
}
int solve(int a[],int len){
	if (len==0) return 1;
	int cnt,l=1,r=len,ans=0;
	for (;l<=len && a[l]==-1;++l);
	if (l==len+1) return 1LL*k*fexp(k-1,len-1)%P;
	for (;r>=1 && a[r]==-1;--r);
	ans=1LL*fexp(k-1,l-1)*fexp(k-1,len-r)%P;
	for (i=l+1;i<=r-1;i=j+1){
		for (cnt=0,j=i;a[j]==-1;++j) cnt+=1;
		ans=1LL*ans*dp[cnt][a[i-1]!=a[j]]%P;
	}
	return ans;
}
int main(){
	read(n),read(k);
	for (i=1;i<=n;++i){
		read(x);
		if (i&1) a[++a[0]]=x;
		else b[++b[0]]=x;
	}
	for (dp[0][1]=1,i=1;i<=n;++i){
		up(dp[i][0],1LL*dp[i-1][1]*(k-1)%P);
		up(dp[i][1],dp[i-1][0]);
		up(dp[i][1],1LL*dp[i-1][1]*(k-2)%P);
	}
	printf("%d\n",1LL*solve(a,a[0])*solve(b,b[0])%P);
	return 0;
}
```