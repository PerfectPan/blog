---
date: 2019-04-17
title: CodeChef April Challenge 2019 Kira Loves Palindromes
description: CodeChef April Challenge 2019 Kira Loves Palindromes
tag:
  - String
  - Binary Search
---

**题目链接**：[https://www.codechef.com/problems/KLPM](https://www.codechef.com/problems/KLPM)

**题意**：给一个字符串，求截出两段非空非交字符串按顺序拼起来后是回文串的方案数。

**思路**：预处理出 $L[i][j]$ 表示 $[i,j]$ 区间以 $i$ 开头的回文串有多少个，$R[i][j]$ 表示 $[i,j]$ 区间以 $j$ 结尾的回文串有多少个。然后枚举两个端点 $p,q$ 往两侧二分最长相等长度，记这个长度为 $len$，则对答案的贡献就是 $len\times (L[i+1][j-2]+R[i+2][j-1]+1)$，加一是表示其中为空串的情况，相当于我们把一个有效的回文串拆成了三段，先找到两边相等的串然后再去统计中间也是回文串的个数，注意这要是与其中某个串拼起来的，这样就可以统计了，时间复杂度 $O(n^2logn)$，判断是否相等用哈希判就好了。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
typedef unsigned long long ull;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0' || ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const ull base=233;
const int N=1000+10;
int i,j,len,l,r,L[N][N],R[N][N];
ll ans;
ull f[2][N],Po[N];
char s[N];
ull getHash(int l,int r){return f[0][r]-f[0][l-1]*Po[r-l+1];}
ull getHash2(int l,int r){return f[1][l]-f[1][r+1]*Po[r-l+1];}
void get(int a,int b){
	int l=1,r=min(a,len-b+1),res=-1;
	while (l<=r){
		int mid=l+((r-l)>>1);
		if (getHash(a-mid+1,a)==getHash2(b,b+mid-1)){
			res=mid;
			l=mid+1;
		}
		else r=mid-1;
	}
	if (~res){
		if (a+1==b-1) ans+=res;
		else ans+=1LL*res*(L[a+1][b-2]+R[a+2][b-1]+1);
	}
}
inline bool isPa(int l,int r){return getHash(l,r)==getHash2(l,r);}
int main(){
	scanf("%s",s+1);len=strlen(s+1);
	for (i=1;i<=len;++i) f[0][i]=f[0][i-1]*base+s[i];
	for (i=len;i>=1;--i) f[1][i]=f[1][i+1]*base+s[i];
	for (Po[0]=i=1;i<=len;++i) Po[i]=Po[i-1]*base;
	for (i=1;i<=len;++i){
		for (j=i;j<=len;++j){
			if (isPa(i,j)){
				L[i][j]++;
				R[i][j]++;
				ans+=j-i;
			}
		}
	}
	for (i=1;i<=len;++i){
		for (j=i+1;j<=len;++j){
			L[i][j]+=L[i][j-1];//[i,j]以i开头是回文串的个数
		}
	}
	for (j=1;j<=len;++j){
		for (i=j-1;i>=1;--i){
			R[i][j]+=R[i+1][j];//[i,j]以j结尾是回文串的个数
		}
	}
	for (i=1;i<=len;++i){
		for (j=i+2;j<=len;++j){
			get(i,j);
		}
	}
	printf("%lld\n",ans);
	return 0;
}
```
