---
date: 2018-07-02
title: Codeforces 997C Sky Full of Stars
description: Codeforces 997C Sky Full of Stars
tag:
  - Math
---

**题目链接**:[http://codeforces.com/problemset/problem/997/C](http://codeforces.com/problemset/problem/997/C)

**题意**：给你一个 $n\times n$ 的空白矩阵，你要往里面染色，可以染的颜色只有三种，符合条件的染色方案是至少出现一行或一列的颜色都是一样的，问合法的方案一共有几种。

**思路**：考虑容斥定理枚举几行几列染的颜色一样我们可以列出该式子：

$$
\sum_{i=0}^{n}\sum_{j=0}^{n}\binom{n}{i}\binom{n}{j}(-1)^{i+j+1}f(i,j)(i+j>0)
$$

其中 $f(i,j)$ 表示枚举有 $i$ 行 $j$ 列的方案数。然后我们来考虑 $f(i,j)$，分析讨论可以知道，当 $i==0||j==0$ 的时候，$f(0,j)=3^j\times 3^{n(n-j)}$,含义就是枚举了 $j$ 列颜色一样，那么这 $j$ 列每列可选的颜色就是三个，即 $3^j$，剩下的各自颜色乱放，即 $3^{n(n-j)}$，然后乘起来即可，否则 $f(i,j)=3\times 3^{(n-i)(n-j)}$，因为这时候你要同时满足枚举的 $i$ 行 $j$ 列颜色都一样，而这行与列一定是有交点的，所以导致的结果就是他们的染色都是一样的，所以我们只有 $3$ 种颜色选择，这样 $f(i,j)$ 就讨论完了，我们也就可以得出一个 $O(n^2logn)$ 或 $O(n^2)$ 的解法，然而这肯定还是不能通过本题，需要对式子进行化简。

我们先 $O(n)$ 算出 $i=0||j=0$ 的情况，然后剩下的式子就变成

$$
\sum_{i=1}^{n}\sum_{j=1}^{n}\binom{n}{i}\binom{n}{j}(-1)^{i+j+1}3\times 3^{(n-i)(n-j)}$$

我们用 $i$ 代换 $n-i$，$j$ 带换 $n-j$，则式子变成

$$
3\sum_{i=0}^{n-1}\sum_{j=0}^{n-1}\binom{n}{i}\binom{n}{j}(-1)^{i+j+1}\times 3^{ij}$$

然后提出 $i$ 相关的系数，则式子变成

$$
3\sum_{i=0}^{n-1}\binom{n}{i}(-1)^{i+1}\sum_{j=0}^{n-1}\binom{n}{j}(-1)^j(3^i)^j
$$

对枚举 $j$ 的部分我们显然可以用二项式定理进行化简，得到

$$
3\sum_{i=0}^{n-1}\binom{n}{i}(-1)^{i+1}[(1+(-3^i))^n-(-3^i)^n]
$$

那么我们就可以在 $O(n)$ 或 $O(n\log n)$ 的时间通过此题了。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
	while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
	return x=f?-x:x; 
}
const int N=1000000+10;
const int P=998244353;
int ans,res,n,i,po[N],jc[N],inv[N];
int ksm(int a,ll n){
	int res=1;
	while (n){
		if (n&1) res=1LL*res*a%P;
		a=1LL*a*a%P;
		n>>=1LL;
	}
	return res;
}
int main(){
	read(n);
	for (jc[0]=po[0]=1,i=1;i<=n;i++){
		jc[i]=1LL*jc[i-1]*i%P;
		inv[i]=ksm(jc[i],P-2);
		po[i]=po[i-1]*3LL%P;
	}

	for (i=1;i<=n;i++){
		int c;
		if (i==n) c=1;
		else{
			c=1LL*jc[n]*inv[i]%P;
			c=1LL*c*inv[n-i]%P;
		}
		int d=1LL*ksm(3,i)*ksm(3,1LL*n*(n-i))%P;
		d=1LL*d*c%P;
		if ((i+1)&1) res-=2LL*d%P;
		else res+=2LL*d%P;
		res%=P;if (res<0) res+=P;
	}
	
	for (i=0;i<=n-1;i++){
		int c=1LL*jc[n]*inv[i]%P;
		c=1LL*c*inv[n-i]%P;
		if (i==0) c=1;

		int d=-po[i];
		d%=P;if (d<0) d+=P;
		
		int tmp=(1+d)%P;
		tmp=ksm(tmp,n)-ksm(d,n);
		tmp%=P;if (tmp<0) tmp+=P;

		tmp=1LL*tmp*c%P;
		if ((i+1)&1) ans-=tmp;
		else ans+=tmp;

		ans%=P;if (ans<0) ans+=P;	
	}
	ans=3LL*ans%P;
	ans=(ans+res)%P;
	printf("%d\n",ans);
	return 0;
}
```
