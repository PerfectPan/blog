---
date: 2018-07-22
title: Codeforces 678F Lena and Queries
description: Codeforces 678F Lena and Queries
tag:
  - Segment Tree
  - Geometry
---

**题目链接**：[http://codeforces.com/contest/678/problem/F](http://codeforces.com/contest/678/problem/F)

**题意**：维护一个点集，要求支持加入和删除的操作，以及能够给定 $x$，找出在点集中的一个点使得 $a\times x+b$ 最大化。

**思路**：首先不考虑加入删除操作，即已知一个点集我们怎么快速找到要求的最大值，而这个就是用到了[Convex Hull Trick](http://wcipeg.com/wiki/Convex_hull_trick),大概讲就是把 $a$ 看成斜率，$b$ 看成截距，那么对应的点集就对应了二维平面上对应的线，我们要做的就是在 $x=x_0$ 这条直线上找到最大的 $y$，我们把每个点对应的最大值连线连起来可以发现这构成了一个下凸壳，所以我们只要对原来的点集求出下凸壳，那么就可以通过二分来找答案了，构造下凸壳的过程就是把所有线按斜率从小到大排序然后用单调栈维护即可。现在考虑加入和删除操作，那么用到了一个技巧就是把这个加入和删除操作当成该点对应的生存区间，我们可以建立以时间为下标的线段树，然后把能生存的节点都加入这个点，但是如果该节点对应的区间完全包含在生存区间里的时候就不再下传，然后对每个节点都求一个下凸壳，查询的时候就从根节点往下走，边走边在这个节点查询最值并更新即可，因为我们要走的区间一定是包含我们查询的时间的点，而我们的区间的含义就是在这一段时间能存活下来的点，这样的话就说明我们查询的时间的点所需要的点集我们都能包括进去，所以是正确的，时间复杂度是 $O(n\log^2n)$ 的，因为每次走节点的时候查询也是带一个 $log$ 的。

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
const int N=3e5+10;
const int DEL=1e9+7;
const ll INF=2000000000000000000LL;
struct Line{
	int k,b;
	Line(){}
	Line(int k,int b):k(k),b(b){}
	bool operator<(const Line&rhs)const{
		return k^rhs.k?k<rhs.k:b<rhs.b;
	}
	ll f(int x){return (ll)k*x+b;}
};
vector<Line>T[N<<2];
pair<int,int>seg[N],op[N];
int n,t,c,i,cnt,S[N];
ll res;
#define lson root<<1,l,mid
#define rson root<<1|1,mid+1,r
void add(int root,int l,int r,int L,int R,Line a){
	if (L<=l&&r<=R){
		T[root].PB(a);
		return;
	}
	int mid=l+((r-l)>>1);
	if (L<=mid) add(lson,L,R,a);
	if (mid<R) add(rson,L,R,a);
}
bool check(vector<Line>& v,int i,int j,int k){
	return (ll)(v[i].b-v[j].b)*(v[k].k-v[i].k)>=(ll)(v[i].b-v[k].b)*(v[j].k-v[i].k);
}
void calc(vector<Line>&T){
	int i,t;
	sort(T.begin(),T.end());
	for (i=0,t=0;i<(int)T.size();++i){
		while ((t&&T[S[t]].k==T[i].k)||(t>1&&check(T,S[t-1],S[t],i))) t--;
		S[++t]=i;
	}
	vector<Line> nxt;
	for (i=1;i<=t;i++) nxt.PB(T[S[i]]);
	T=nxt;
}
ll get(int x,int root){
	if (!T[root].size()) return -INF;
	int l=0,r=(int)T[root].size()-2,res=0;
	while (l<=r){
		int mid=l+((r-l)>>1);
		if (T[root][mid].f(x)<=T[root][mid+1].f(x)){
			l=mid+1;
			res=mid+1;
		}
		else r=mid-1;
	}
	return T[root][res].f(x);
}
void query(int root,int l,int r,int pos,int x){
	res=max(res,get(x,root));
	if (l==r) return;
	int mid=l+((r-l)>>1);
	if (pos<=mid) query(lson,pos,x);
	else query(rson,pos,x);
}
int main(){
	read(n);
	for (i=1;i<=n;++i){
		read(c),read(seg[i].first);
		if (c==1) read(seg[i].second);
		else if (c==2){
			int x=seg[i].first;
			add(1,1,n,x,i,Line(seg[x].first,seg[x].second));
			seg[x].first=seg[i].first=DEL;
		}
		else op[++cnt]=MP(seg[i].first,i),seg[i].first=DEL;
	}
	for (i=1;i<=n;++i)if(seg[i].first!=DEL){
		add(1,1,n,i,n,Line(seg[i].first,seg[i].second));
	}
	for (i=1;i<=(n<<1);++i)if(T[i].size())calc(T[i]);
	for (i=1;i<=cnt;++i){
		res=-INF;
		query(1,1,n,op[i].second,op[i].first);
		if (res==-INF) puts("EMPTY SET");
		else printf("%lld\n",res);
	}
	return 0;
}
```
