---
date: 2019-09-17

title: 银联极客高校挑战赛复赛 D 多项式

description: 

tag:
	- DP
---

**题目链接**：[https://nanti.jisuanke.com/t/40551](https://nanti.jisuanke.com/t/40551)

**题意**：给定一棵树，树有边权，求任选两个点为起终点路径上边权和的$k$次方的期望。

**思路**：求期望没什么用，本质要算所有路径边权和的 $k$ 次方之和，考虑树形 DP，定义 $f[u][i]$ 为以 $u$ 为端点，向下延伸的所有路径边权和的 $i$ 次方之和，转移考虑 $u$ 到儿子 $v$ 的边权 $w$，已知 $f[v]$ 所有的值，要转移到 $f[u][i]$，其实就是枚举以 $v$ 为端点向下延伸的所有路径 $left$，相当于 $$\sum_{left}(w+left)^i$$，把二项式拆开等价于$$\sum_{left}\sum_{j=0}^{i}\binom{i}{j}w^j left^{j-i}$$，交换 $sigma$ 可以得到 $$\sum_{j=0}^{i}\binom{i}{j}w^j\sum_{left}left^{j-i}$$ 其中 $\sum_{left}left^{j-i}=f[v][j-i]$，然后就可以转移了。这里还漏了一个情况是以 $u$ 为端点，从 $u$ 的父亲过来的所有路径之和的 $i$ 次方之和，我们定义为 $g[u][i]$，转移可以考虑 $u$ 的父亲 $p$，然后相当于我们知道了 $g[p]$ 的所有信息和 $f[p]$ 除 $p$ 所有经过 $u$ 的路径贡献的信息（可以减去），转移也就跟上面一样了，时间复杂度 $O(nk^2)$。

```cpp
#include<bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0' || ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0'&& ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int P=998244353;
const int N=1e5+10;
int i,j,n,K,u,v,w,ans,C[15][15],f[N][15],g[N][15],h[15],t[15];
vector<pair<int,int> >G[N];
int fexp(int a,int n){
    int res=1;
    while (n){
        if (n&1) res=(ll)res*a%P;
        a=(ll)a*a%P;
        n>>=1;
    }
    return res;
}
inline void up(int&a,int b){a+=b;if(a>=P)a-=P;}
void dfs(int u,int fa){
    f[u][0]=1;
    for (int i=0;i<(int)G[u].size();++i){
        int v=G[u][i].first,w=G[u][i].second;
        if (v==fa) continue;
        dfs(v,u);
        h[0]=1;
        for (int j=1;j<=K;++j) h[j]=(ll)h[j-1]*w%P;
        for (int j=0;j<=K;++j){
            for (int k=0;k<=j;++k){
                up(f[u][j],(ll)C[j][k]*h[j-k]%P*f[v][k]%P);
            }
        }
    }
    up(ans,f[u][K]);
}
void dfs2(int u,int fa){
    for (int i=0;i<(int)G[u].size();++i){
        int v=G[u][i].first,w=G[u][i].second;
        if (v==fa) continue;
        h[0]=1;
        for (int j=1;j<=K;++j) h[j]=(ll)h[j-1]*w%P;
        for (int j=0;j<=K;++j){
            t[j]=0;
            for (int k=0;k<=j;++k){
                up(t[j],(ll)C[j][k]*h[j-k]%P*f[v][k]%P);
            }
        }
        for (int j=0;j<=K;++j){
            g[v][j]=0;
            for (int k=0;k<=j;++k){
                int tmp=(g[u][k]+f[u][k]-t[k])%P;
                if (tmp<0) tmp+=P;
                up(g[v][j],(ll)C[j][k]*h[j-k]%P*tmp%P);
            }
        }
        up(ans,g[v][K]);
        dfs2(v,u);
    }
}
int main(){
    read(n),read(K);
    for (i=0;i<=K;++i) C[i][0]=C[i][i]=1;
    for (i=1;i<=K;++i){
        for (j=1;j<i;++j){
          up(C[i][j],C[i-1][j]);
          up(C[i][j],C[i-1][j-1]);
        }
    }
    for (i=1;i<n;++i){
        read(u),read(v),read(w);
        G[u].PB(MP(v,w));
        G[v].PB(MP(u,w));
    }
    dfs(1,0),dfs2(1,0);
    int inv=fexp(n,P-2);
    ans=(ll)ans*inv%P*inv%P;
    printf("%d\n",ans);
    return 0;
}
```