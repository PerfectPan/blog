---
date: 2018-01-30
title: Codeforces 917B MADMAX
description: Codeforces 917B MADMAX
tag:
  - DP
  - Game Theory
---

**题目链接**：[http://codeforces.com/problemset/problem/917/B](http://codeforces.com/problemset/problem/917/B)

**题意**：给你一张有向无环图，每条边的边权是字母，现在两个人玩游戏，每个人从各自选的起点出发开始走，每次只能往边权不小于上一轮的边权的方向走，谁先不能走谁就输，现在叫你输出一张 $ N \times M $ 的表， $ (i,j) $ 表示第一个人从 $ i $ 位置出发第二个人从 $ j $ 位置出发且第一个人先手，这个点输出最后获胜的玩家。

**思路**：博弈 $ DP $ 加记忆化搜索，我们设 $ dp(u,v,c) $ 表示先手在位置 $ u $，后手在位置 $ v $，且当前出发的边权不得小于 $ c $ 时获胜的情况， $ false $ 表示先手必败那么现在肯定是 $ u $ 要走了，如果 $ u $ 能找到一条路，这条路的另一个顶点是 $ x $，满足走的边权 $ d $ 是大于等于 $ c $，且 $ dp(v,x,d)==false $，即先手必败，这个时候相当于下一轮的时候是后手要动了，那么我们可以肯定这时 $ dp(u,v,c)==true $，又因为整张图没有环，所以我们记忆化搜索一下就可以了。

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
typedef pair<int,int> PII;
const int maxn=500+5;
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
int n,m,u,v;
char ch[2];
int dp[105][105][26];
vector<PII>G[105];
int dfs(int u,int v,int c){
    if (dp[u][v][c]!=-1) return dp[u][v][c];
    for (int i=0;i<(int)G[u].size();i++){
        int x=G[u][i].F,limit=G[u][i].S;
        if (limit<c) continue;
        if (!dfs(v,x,limit)) return dp[u][v][c]=1;
    }
    return dp[u][v][c]=0;
}
int main(){
    read(n),read(m);
    for (int i=1;i<=m;i++){
        scanf("%d%d%s",&u,&v,ch);
        G[u].pb(make_pair(v,ch[0]-'a'));
    }
    memset(dp,-1,sizeof(dp));
    for (int i=1;i<=n;i++){
        for (int j=1;j<=n;j++){
            putchar(dfs(i,j,0)?'A':'B');
        }
        puts("");
    }
    return 0;
}

```
