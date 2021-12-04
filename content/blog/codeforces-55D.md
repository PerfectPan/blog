---
date: 2018-08-01
title: Codeforces 55D Beautiful numbers
description: Codeforces 55D Beautiful numbers
tag:
  - DP
---

**题目链接**:[https://codeforces.com/problemset/problem/55/D](https://codeforces.com/problemset/problem/55/D)

**题意**:输出 $[L,R]$ 中满足这个数对它自己每一位非零数字都整除的数的个数.

**思路**:刚开始想了枚举数的集合然后数位 $DP$ 但是实在是太慢了...看了题解才知道我们已知 $1..9$ 的最小公倍数是 $2520$,那么我们假设要求数 $x$ 模 $y$ 是等于 $0$ 的,然后我们改写 $x$ 为 $x=x\bmod 2520+2520\times k$ 已知 $2520$ 一定整除 $y$ 所以问题就转化成 $x\bmod 2520$ 是否整除它数位上的每一个非零的数字,定义 $dp[i][j][S][k]$ 表示从高到低考虑前 $i$ 个数位模 $2520$ 为 $j$,已经出现的非零的数字集合为 $S$,当前 $i$ 是否等于 $n$ 的情况为 $k$ 的方案数然后 $DP$,记忆化搜索去掉最后一维去搜索即可,注意到什么数都整除 $1$ 所以只要考虑 $[2,9]$ 即可.

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
const int P=2520;
int T,status,i,digit[20];
ll l,r,ans,dp[20][256][2520];
ll dfs(int pos,int S,int num,bool jud){
	if (!pos){
		for (int i=0;i<8;++i)if(S&(1<<i)){
			if (num%(i+2)) return 0;
		}
		return 1;
	}
	if (!jud && ~dp[pos][S][num]) return dp[pos][S][num];
	int limit=jud?digit[pos]:9;
	ll ret=0;
	for (int i=0;i<=limit;++i){
		ret+=dfs(pos-1,i>1?S|(1<<(i-2)):S,(num*10+i)%P,jud && i==limit);
	}
	if (!jud) dp[pos][S][num]=ret;
	return ret;
}
ll cal(ll x){
	if (!x) return 1;
	int len=0;
	while (x){
		digit[++len]=x%10;
		x/=10;
	}
	return dfs(len,0,0,1);
}
int main(){
	memset(dp,-1,sizeof(dp));
	for (read(T);T--;){
		read(l),read(r);
		printf("%lld\n",cal(r)-cal(l-1));
	}
	return 0;
}
```
