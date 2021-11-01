---
date: 2019-04-22
title: 2019 ICPC 南昌邀请赛网络赛 G. tsy's number
description: 2019 ICPC 南昌邀请赛网络赛 G. tsy's number
tag:
  - Number Theory
---

**题目链接**：[https://nanti.jisuanke.com/t/38226](https://nanti.jisuanke.com/t/38226)

**题意**：求 $\sum_{i=1}^{n}\sum_{j=1}^{n}\sum_{k=1}^{n}\frac{\phi(i)\phi(j^2)\phi(k^3)}{\phi(i)\phi(j)\phi(k)}\phi(gcd(i,j,k))$

**思路**：由欧拉函数性质 $\phi(ab)=\phi(a)\phi(b)\frac{gcd(a,b)}{\phi(gcd(a,b))}$ 得

$$
\sum_{i=1}^{n}\sum_{j=1}^{n}\sum_{k=1}^{n}jk^2\phi(gcd(i,j,k))
$$

按照惯例枚举 $gcd$,得 

$$
\sum_{d=1}^{n}\phi(d)\sum_{i=1}^{n}\sum_{j=1}^{n}\sum_{k=1}^{n}jk^2[gcd(i,j,k)==d]$$

我们定义 $f(d)=\sum_{i=1}^{n}\sum_{j=1}^{n}\sum_{k=1}^{n}jk^2[gcd(i,j,k)==d]$，$g(d)$ 表示 $d|gcd(i,j,k)$ 的答案，则

$$
g(d)=\sum_{x=1}^{\lfloor\frac{n}{d}\rfloor}f(d * x)
$$

莫比乌斯反演得到

$$
f(d)=\sum_{x=1}^{\lfloor\frac{n}{d}\rfloor}\mu(x)g(d * x)
$$

其中 $g(d * x)=\lfloor\frac{n}{d * x}\rfloor getSum(\lfloor\frac{n}{d * x}\rfloor) getSumSquare(\lfloor\frac{n}{d * x}\rfloor) * (d * x)^3$，所以式子化为

$$
\sum_{d=1}^{n}\phi(d)\sum_{x=1}^{\lfloor\frac{n}{d}\rfloor}\mu(x)g(d * x)
$$

继续按照套路枚举定值 $T=d * x$，式子化为

$$
\sum_{T=1}^{n}g(T)\sum_{d|T}\phi(d)\mu(\frac{T}{d})
$$

$g(T)$ 代入得 

$$
\sum_{T=1}^{n}\lfloor\frac{n}{T}\rfloor getSum(\lfloor\frac{n}{T}\rfloor) getSumSquare(\lfloor\frac{n}{T}\rfloor) * T^3\sum_{d|T}\phi(d)\mu(\frac{T}{d})
$$

，后面 $\phi$ 和 $\mu$ 都是积性函数，狄利克雷卷积以后还是积性函数，可以线性筛预处理，推一下质数和质数的幂的时候对应的值是多少就好了，然后跟 $T^3$ 乘起来求一个前缀和，前面下底整除函数分块求就好了，预处理 $O(n)$，单次查询 $O(\sqrt n)$，时间复杂度 $O(n+T\sqrt n)$，注意模数不是质数，所以没法用费马小定理直接求，在 $getSumSquare(\lfloor\frac{n}{d * x}\rfloor)$ 的时候要除 $6$，可以前面先除 $2$ 然后再用扩展欧几里得求 $3$ 和 $2^{30}$ 的逆元即可，扩欧是可以求互质的逆元的，这样就可以了。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0' || ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=1e7+10;
const int P=1<<30;
int T,n,ans,i,j,last,primes[N],low[N],f[N];
inline void up(int&a,int b){a+=b;if(a>=P)a-=P;}
void sieve(){
    for (low[1]=f[1]=1,i=2;i<=1e7;++i){
        if (!primes[i]) primes[++primes[0]]=low[i]=i,f[i]=i-2;
        for (j=1;j<=primes[0]&&i*primes[j]<=1e7;++j){
            primes[i*primes[j]]=1;
            if (i%primes[j]==0){
                low[i*primes[j]]=low[i]*primes[j];
                if (low[i]==i) f[i*primes[j]]=f[i]==i-2?1LL*(i-1)*(i-1)%P:1LL*f[i]*primes[j]%P;
                else f[i*primes[j]]=1LL*f[i/low[i]]*f[low[i]*primes[j]]%P;
                break;
            }
            low[i*primes[j]]=primes[j];
            f[i*primes[j]]=1LL*f[i]*f[primes[j]]%P;
        }
    }
    for (i=2;i<=1e7;++i){
        f[i]=1LL*f[i]*i%P*i%P*i%P;
    	up(f[i],f[i-1]);
    }
}
inline int get2(int x){return 1LL*x*(x+1)/2%P;}
inline int get3(int x){return 1LL*x*(x+1)/2%P*(2*x+1)%P*715827883%P;}
int main(){
	sieve();
	while (~scanf("%d",&T)){
		for (;T--;){
			read(n);
			for (ans=0,i=1;i<=n;i=last+1){
				last=n/(n/i);
				int val=f[last]-f[i-1];
				if (val<0) val+=P;
				int A=n/i;
				int B=get2(n/i);
				int C=get3(n/i);
				val=1LL*val*A%P;
				val=1LL*val*B%P;
				val=1LL*val*C%P;
				up(ans,val);
			}
			printf("%d\n",ans);
		}
	}
	return 0;
}
```
