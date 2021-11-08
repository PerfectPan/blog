---
date: 2018-09-04
title: 2016 计蒜之道 初赛 第一场  青云的机房组网方案（困难）
description: 2016 计蒜之道 初赛 第一场  青云的机房组网方案（困难）
tag:
  - Data Structure
---

**题目链接**：[https://nanti.jisuanke.com/t/11135](https://nanti.jisuanke.com/t/11135)

**题意**：略。

**思路**：正难则反，考虑将问题转成树上两两之间距离之和-树上两两不互质点对的距离之和，对于前者，考虑一条边对答案的贡献，即 $sz[u]\times (n-sz[u])$，表示这条边两边选的点对的方案。考虑后者，值域不是很大，一个数的质因子不是很多，可以用容斥定理去算，对于一个因数，是这个因数倍数的点不会很多，把因数当作一个询问，最后的点数大约与 $n$ 同阶，所以把每个因数拉出来建一棵虚树，然后问题转成树上两两之间距离之和，跑一遍 $dfs$ 即可。

```cpp
#include <bits/stdc++.h>
#define PB emplace_back
#define MP make_pair
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
int n,i,j,u,v,dfs_clock,a[N],primes[N],mu[N],bel[N],fa[N],dep[N],sz[N],son[N],dfn[N];
ll ans,res;
vector<int>G[N],G2[N],fac[N];
void sieve(){
	for (mu[1]=1,i=2;i<=100000;i++){
		if (!primes[i]) primes[++primes[0]]=i,mu[i]=-1;
		for (j=1;j<=primes[0] && i*primes[j]<=100000;j++){
			primes[i*primes[j]]=1;
			if (i%primes[j]==0){
				mu[i*primes[j]]=0;
				break;
			}
			else mu[i*primes[j]]=-mu[i];
		}
	}
}
void dfs(int u,int f){
	fa[u]=f,dep[u]=dep[f]+1,son[u]=-1,dfn[u]=++dfs_clock,sz[u]=1;
	for (int i=0;i<(int)G[u].size();i++){
		int v=G[u][i];
		if (v==f) continue;
		dfs(v,u);
		sz[u]+=sz[v];
		if (son[u]==-1 || sz[v]>sz[son[u]]) son[u]=v;
	}
	ans+=1LL*(n-sz[u])*sz[u];
}
void dfs2(int u,int f){
	bel[u]=f;
	if (son[u]==-1) return;
	dfs2(son[u],f);
	for (int i=0;i<(int)G[u].size();i++){
		int v=G[u][i];
		if (v==fa[u] || v==son[u]) continue;
		dfs2(v,v);
	}
}
int lca(int u,int v){
	for (;bel[u]!=bel[v];dep[bel[u]]>dep[bel[v]]?u=fa[bel[u]]:v=fa[bel[v]]);
	return dep[u]>dep[v]?v:u;
}
void dfs(int u,int f,int tot){
	for (int i=0;i<(int)G2[u].size();i++){
		int v=G2[u][i];
		if (v==f) continue;
		dfs(v,u,tot);
		sz[u]+=sz[v];
	}
	if (f) res+=1LL*abs(dep[u]-dep[f])*sz[u]*(tot-sz[u]);
	G2[u].clear();
}
inline bool cmp(const int&a,const int&b){return dfn[a]<dfn[b];}
void addEdge(int u,int v){
	G2[u].PB(v);
	G2[v].PB(u);
}
ll solve(int val){
	static int points[N],stk[N];
	int cnt=0,top=0;
	for (int i=val;i<=100000;i+=val){
		for (int j=0;j<(int)fac[i].size();j++){
			points[cnt++]=fac[i][j];
			sz[fac[i][j]]=1;
		}
	}
	if (cnt<=1) return 0;
	sort(points,points+cnt,cmp);

	sz[0]=0,stk[top++]=0;
	for (int i=0;i<cnt;i++){
		int u=points[i],f=lca(u,stk[top-1]);
		if (f==stk[top-1]) stk[top++]=u;
		else{
			while (top-2>=0 && dep[stk[top-2]]>=dep[f]){
				addEdge(stk[top-1],stk[top-2]);
				top--;
			}
			if (f!=stk[top-1]){
				addEdge(f,stk[--top]);
				stk[top++]=f,sz[f]=0;//不是关键点的sz应设为0以不影响答案
			}
			stk[top++]=u;
		}
	}

	for (int i=0;i<top-1;i++) addEdge(stk[i],stk[i+1]);
	res=0,dfs(0,0,cnt);
	return res*mu[val];
}
int main(){
	sieve();
	read(n);
	for (i=1;i<=n;i++){
		read(a[i]);
		fac[a[i]].PB(i);
	}
	for (i=1;i<n;i++){
		read(u),read(v);
		G[u].PB(v);
		G[v].PB(u);
	}
	dfs(1,0),dfs2(1,1);
	for (i=2;i<=100000;i++)if(mu[i])ans+=solve(i);
	printf("%lld\n",ans);
	return 0;
}
```
