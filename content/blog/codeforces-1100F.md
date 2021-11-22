---
date: 2019-01-18
title: Codeforces 1100F Ivan and Burgers
description: Codeforces 1100F Ivan and Burgers
tag:
  - Greedy
  - Data Structure
  - Divide and Conquer
---

**题目链接**：[https://codeforces.com/problemset/problem/1100/F](https://codeforces.com/problemset/problem/1100/F)

**题意**：给定一个序列，若干次询问，每次询问区间最大异或和。

**思路**：直接线段树维护区间线性基时间复杂度是 $O((n+q)\log n\log^2C)$的，肯定无法通过，要另想办法。那么离线有两种思路，一种是线性基贪心，网上这种解题报告有很多，就不再赘述，大概就是离线从左往右加入尽可能保存靠右的位置。还有一种就是利用分治的思想，我们将询问离线，假设是 $solve(l,r)$，那么我们只处理询问区间跨过 $mid$ 的询问，其他的递归下去解决。对于跨过区间的询问，我们维护两个线性基数组 $f[i]$ 和 $g[i]$,$f[i]$ 表示从 $i->mid$ 的这个区间的线性基，$g[i]$ 表示从 $mid+1->i$ 的这个区间的线性基，对于询问 $[L,R]$ 我们直接把 $f[L]$ 和 $g[R]$ 两个线性基合并然后去找异或最大和即可。对于 $q$ 次询问的复杂度无疑是线性基合并的复杂度 $O(log^2C)$，整个分治的复杂度我们可以列出式子 

$$
T(n)=2T(n/2)+O(nlogC)
$$ 

$O(nlogC)$ 是预处理 $f$ 和 $g$ 数组的复杂度，那么整合一下最后的复杂度大致就是 $O(n\log n\log C+q\log^2C)$，比第一种贪心想法多一个 $log$，但是更好想一点。

## 离线分治
```cpp
#include <bits/stdc++.h>
#define PB emplace_back
using namespace std;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
	while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
	return x=f?-x:x;
}
const int N=5e5+10;
const int LL=21;
int n,q,i,ans[N],c[N],L[N],R[N],tmp[LL+1],f[N][LL+1],g[N][LL+1];
vector<int>v;
int work(int* f,int* g){
	int i,j,ret=0;
	for (i=0;i<=LL;++i) tmp[i]=f[i];
	for (i=0;i<=LL;++i){
		int t=g[i];
		for (j=LL;j>=0;--j){
			if (!(t&(1LL<<j))) continue;
        	if (!tmp[j]){
            	tmp[j]=t;
            	break;
            }
            t^=tmp[j];
		}
	}
	for (i=LL;i>=0;--i){
		if ((ret^tmp[i])>ret) ret^=tmp[i];
	}
	return ret;
}	
void solve(int l,int r,vector<int> v){
	if (l>r || v.size()==0) return;
	int i,j,mid=l+((r-l)>>1);
	if (l+1>=r){
		for (i=0;i<(int)v.size();++i){
			if (L[v[i]]==R[v[i]]) ans[v[i]]=c[L[v[i]]];
			else{
				ans[v[i]]=max(c[L[v[i]]],c[R[v[i]]]);
				ans[v[i]]=max(ans[v[i]],c[L[v[i]]]^c[R[v[i]]]);
			}
		}
		return;
	}
	for(i=l;i<=mid+1;++i)for(j=0;j<=LL;++j)f[i][j]=0;
	for (i=mid;i>=l;--i){
		for (j=0;j<=LL;++j) f[i][j]=f[i+1][j];
		int t=c[i];
		for (j=LL;j>=0;--j){
			if (!(t&(1LL<<j))) continue;
        	if (!f[i][j]){
            	f[i][j]=t;
            	break;
            }
            t^=f[i][j];
		}
	}

	for (i=mid;i<=r;++i)for(j=0;j<=LL;++j)g[i][j]=0;
	for (i=mid+1;i<=r;++i){
		for (j=0;j<=LL;++j) g[i][j]=g[i-1][j];
		int t=c[i];
		for (j=LL;j>=0;--j){
			if (!(t&(1LL<<j))) continue;
        	if (!g[i][j]){
            	g[i][j]=t;
            	break;
            }
            t^=g[i][j];
		}
	}
	vector<int>vl,vr;
	for (i=0;i<(int)v.size();++i){
		if (L[v[i]]>mid) vr.PB(v[i]);
		else if (R[v[i]]<mid) vl.PB(v[i]);
		else{
			ans[v[i]]=work(f[L[v[i]]],g[R[v[i]]]);
		}
	}
	solve(l,mid-1,vl);
	solve(mid+1,r,vr);
}
int main(){
	for (read(n),i=1;i<=n;++i) read(c[i]);
	for (read(q),i=1;i<=q;++i){
		read(L[i]),read(R[i]);
		v.PB(i);
	}
	solve(1,n,v);
	for (i=1;i<=q;++i) printf("%d\n",ans[i]);
	return 0;
}
```

## 离线贪心
```cpp
#include <bits/stdc++.h>
using namespace std;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
	while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
	return x=f?-x:x;
}
const int N=5e5+10;
const int L=21;
struct LinearBasis{
    int a[L+1],pos[L+1];
    LinearBasis(){
        fill(a,a+L+1,0);
        fill(pos,pos+L+1,0);
    }
    void insert(int t,int id){
        for (int j=L;j>=0;j--){
            if (!(t&(1LL<<j))) continue;
            if (!a[j]){
            	a[j]=t;
            	pos[j]=id;
            	return;
            }
            if (pos[j]<id){
            	swap(pos[j],id);
            	swap(t,a[j]);
            }
            t^=a[j];
        }
    }
    int querymax(int l){
        int ret=0;
        for (int i=L;i>=0;--i){
            if (pos[i]>=l && (ret^a[i])>ret) ret^=a[i];
        }
        return ret;
    }
}P;
struct Query{
	int l,r,id;
	bool operator<(const Query&rhs)const{
		return r<rhs.r;
	}
}qu[N];
int n,q,i,r,c[N],ans[N];
int main(){
	read(n);
	for (i=1;i<=n;++i) read(c[i]);
	for (read(q),i=1;i<=q;++i){
		read(qu[i].l),read(qu[i].r),qu[i].id=i;
	}
	sort(qu+1,qu+1+q);
	for (i=r=1;i<=q;++i){
		while (r<=qu[i].r) P.insert(c[r],r),r+=1;
		ans[qu[i].id]=P.querymax(qu[i].l);
	}
	for (i=1;i<=q;++i) printf("%d\n",ans[i]);
	return 0;
}
```
