---
date: 2017-12-27
title: Codeforces 570D Tree Requests
description: Codeforces 570D Tree Requests
tag:
  - Dsu on Tree
---

**题目链接**：[http://codeforces.com/problemset/problem/570/D](http://codeforces.com/problemset/problem/570/D)

**题意**：给出一棵树，根节点为 $1$。这棵树每个顶点上有一个小写字母，多次询问子树 $v$ 中，深度为 $deep$ 的点的字母任意组合，能否形成一个回文串。 

**思路**：考虑形成回文串的条件：奇数字符数小于等于 $1$，所以对此我们可以状压 $26$ 个字母，然后统计对应深度的奇数字符的数量，直接异或即可，偶数次异或结果为 $0$，奇数次结果异或为 $1$，最后统计对应深度的数二进制展开 $1$ 的数量即可知道奇数字符的数量，然后结合 $Dsu\ on\ Tree$ 即可解决。

```cpp
#pragma comment(linker, "/STACK:102400000,102400000")
#include <map>
#include <set>
#include <stack>
#include <queue>
#include <cmath>
#include <string>
#include <vector>
#include <cstdio>
#include <cctype>
#include <cstring>
#include <sstream>
#include <cstdlib>
#include <iostream>
#include <algorithm>
#define lson root<<1,l,mid
#define rson root<<1|1,mid+1,r
#define Key_Value ch[ch[root][1]][0]
#define DBN1(a)           cerr<<#a<<"="<<(a)<<"\n"
#define DBN2(a,b)         cerr<<#a<<"="<<(a)<<", "<<#b<<"="<<(b)<<"\n"
#define DBN3(a,b,c)       cerr<<#a<<"="<<(a)<<", "<<#b<<"="<<(b)<<", "<<#c<<"="<<(c)<<"\n"
#define DBN4(a,b,c,d)     cerr<<#a<<"="<<(a)<<", "<<#b<<"="<<(b)<<", "<<#c<<"="<<(c)<<", "<<#d<<"="<<(d)<<"\n"
#define DBN5(a,b,c,d,e)   cerr<<#a<<"="<<(a)<<", "<<#b<<"="<<(b)<<", "<<#c<<"="<<(c)<<", "<<#d<<"="<<(d)<<", "<<#e<<"="<<(e)<<"\n"
#define DBN6(a,b,c,d,e,f) cerr<<#a<<"="<<(a)<<", "<<#b<<"="<<(b)<<", "<<#c<<"="<<(c)<<", "<<#d<<"="<<(d)<<", "<<#e<<"="<<(e)<<", "<<#f<<"="<<(f)<<"\n"
#define clr(a,x) memset(a,x,sizeof(a))
#define pb push_back
#define ALL(x) x.begin(),x.end()
#define F first
#define S second
using namespace std;
typedef long long ll;
const int maxn=500000+5;
const int INF=0x3f3f3f3f;
const int P=1000000007;
const double PI=acos(-1.0);
template<typename T>
inline T read(T&x){
    x=0;int _f=0;char ch=getchar();
    while(ch<'0'||ch>'9')_f|=(ch=='-'),ch=getchar();
    while(ch>='0'&&ch<='9')x=x*10+ch-'0',ch=getchar();
    return x=_f?-x:x;
}
template <class T1, class T2>inline void gmax(T1 &a,T2 b){if (b>a) a=b;}
template <class T1, class T2>inline void gmin(T1 &a,T2 b){if (b<a) a=b;}
int n,m,skip,cnt,sz[maxn],son[maxn],dep[maxn],F[maxn],ans[maxn];
char s[maxn];
vector<int>G[maxn],q[maxn],qd[maxn];
void dfs(int u,int f){
    dep[u]=dep[f]+1;
    sz[u]=1;
    son[u]=-1;
    for (int i=0;i<(int)G[u].size();i++){
        int v=G[u][i];
        if (v==f) continue;
        dfs(v,u);
        sz[u]+=sz[v];
        if (son[u]==-1 || sz[v]>sz[son[u]]){
            son[u]=v;
        }
    }
}
void add(int u,int f){
    F[dep[u]]^=(1<<(s[u]-'a'));
    for (int i=0;i<(int)G[u].size();i++){
        int v=G[u][i];
        if (v==f || v==skip) continue;
        add(v,u);
    }
}
void dfs(int u,int f,bool keep){
    for (int i=0;i<(int)G[u].size();i++){
        int v=G[u][i];
        if (v==f || v==son[u]) continue;
        dfs(v,u,0);
    }
    if (son[u]!=-1) dfs(son[u],u,1),skip=son[u];
    add(u,f);
    for (int i=0;i<(int)q[u].size();i++){
        ans[q[u][i]]=F[qd[u][i]];
    }
    skip=0;
    if (!keep) add(u,f);
}
int main(){
    read(n),read(m);
    for (int i=2;i<=n;i++){
        int x;read(x);
        G[i].pb(x);
        G[x].pb(i);
    }
    scanf("%s",s+1);
    for (int i=1;i<=m;i++){
        int x,deep;read(x),read(deep);
        qd[x].pb(deep);
        q[x].pb(i);
    }
    dfs(1,0);
    dfs(1,0,0);
    for (int i=1;i<=m;i++){
        int t=__builtin_popcount(ans[i]);
        puts(t<=1?"Yes":"No");
    }
    return 0;
}

```
