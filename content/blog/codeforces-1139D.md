---
date: 2019-03-23
title: Codeforces 1139D Steps to One
description: Codeforces 1139D Steps to One
tag:
  - DP
  - Math
---

**题目链接**：[https://codeforces.com/contest/1139/problem/D](https://codeforces.com/contest/1139/problem/D)

**题意**：有一个数组刚开始为空，每次等概率随机一个 $[1,m]$ 的数字加入到数组末尾，当整个数组 $gcd$ 为 $1$ 时停止加入，问期望步长。

**思路**：定义 $dp[x]$ 为整个数组 $gcd$ 为 $x$ 时期望停止的步长，则由全期望公式得转移方程为：

$$
dp[x]=1+\sum_{i=1}^{m}\frac{dp[gcd(i,x)]}{m}
$$

我们把 $gcd(i,x)==x$ 的项移到左边就可以在 $O(m^2)$ 的时间内暴力解出，但这无疑会超时，考虑到 $gcd(i,x)$ 一定是 $x$ 的约数，所以我们可以枚举 $x$ 的约数 $y$ 同时计算出 $\sum_{i=1}^{m}[gcd(i,x)==y]$ 的个数，这是一个经典的反演式子，可以加速计算，最后求出所有 $dp$ 值以后，考虑第一步数组为空，所以由全期望公式就可以得出答案为：

$$
1+\sum_{i=1}^{m}\frac{dp[i]}{m}
$$

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
const int P=1e9+7;
int m,i,j,inv,ans=1,dp[N],mu[N],primes[N];
vector<int>fac[N];
void init(){
    for (mu[1]=1,i=2;i<=1e5;i++){
        if (!primes[i]) primes[++primes[0]]=i,mu[i]=-1;
        for (j=1;j<=primes[0]&&i*primes[j]<=1e5;j++){
            primes[i*primes[j]]=1;
            if (i%primes[j]==0){
                mu[i*primes[j]]=0;
                break;
            }
            else mu[i*primes[j]]=-mu[i];
        }
    }
    for (i=1;i<=1e5;++i){
    	for (j=i*2;j<=1e5;j+=i){
    		fac[j].PB(i);
    	}
    }
}
int fexp(int a,int n){
	int res=1;
	while (n){
		if (n&1) res=1LL*res*a%P;
		a=1LL*a*a%P;
		n>>=1;
	}
	return res;
}
inline void up(int&a,int b){a+=b;if(a>=P)a-=P;}
int totCount(int y,int x){
	int cnt=0;
	x/=y;
	for (int i=0;i<(int)fac[x].size();++i){
		int d=fac[x][i];
		int res=mu[d]*(m/y/d);
		if (res<0) res+=P;
		up(cnt,res);
	}
	int res=mu[x]*(m/y/x);
	if (res<0) res+=P;
	up(cnt,res);
	return cnt;
}
int main(){
	init();
	inv=fexp(read(m),P-2);
	for (dp[1]=0,i=2;i<=m;++i){
		int res=1;
		for (j=0;j<(int)fac[i].size();++j){
			int cnt=totCount(fac[i][j],i);
			up(res,1LL*dp[fac[i][j]]*cnt%P*inv%P);
		}
		dp[i]=1LL*res*m%P*fexp(m-m/i,P-2)%P;
		up(ans,1LL*dp[i]*inv%P);
	}
	printf("%d\n",ans);
	return 0;
}
```