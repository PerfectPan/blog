---
date: 2019-12-01
title: Codeforces Round#603(Div. 2) E/F 题解
description: Codeforces Round#603(Div. 2) E/F 题解
tag:
  - DP
  - Stack
---

**比赛地址**：[https://codeforces.com/contest/1263](https://codeforces.com/contest/1263)

## E-Editor

**题意：**模拟打字，光标可以左移右移或者输入左括号右括号或者小写字母，现在给你操作序列，问每次操作完以后当前输入的字符串最深括号深度如果括号序列是合法的。
**思路:** 用 $HDU4699$ 一样的思路去做就好了，维护前缀和，最大最小前缀和一共 $6$ 个栈，如果括号序列是合法的，最深的括号深度就是前缀和最大的那个，最小前缀和是为了判定是否合法的，因为出现负数就说明不合法，时间复杂度 $O(n)$。
**代码:**

```cpp
#include<bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=1e6+10;
int n,i,topA=1,topB,a[N],b[N],pre[N],suf[N],f[N],f2[N],f3[N],f4[N];
char s[N];
void update(int x,int val){
    a[x]=val;
    pre[x]=pre[x-1]+a[x];
    f[x]=max(f[x-1],pre[x]);
    f2[x]=min(f2[x-1],pre[x]);
}
int main(){
    read(n);
    scanf("%s",s+1);
    int ans=-1;
    f2[0]=f4[0]=0x3f3f3f3f;
    for (i=1;i<=n;++i){
        if (s[i]=='(') update(topA,1);
        else if (s[i]==')') update(topA,-1);
        else if (s[i]=='L'){
            if (topA>=2){
                b[++topB]=a[topA--];
                suf[topB]=suf[topB-1]+b[topB]*-1;
                f3[topB]=max(f3[topB-1],suf[topB]);
                f4[topB]=min(f4[topB-1],suf[topB]);
            }
        }
        else if (s[i]=='R'){
            ++topA;
            if (topB){
                update(topA,b[topB]);
                topB--;
            }
            else{
                update(topA,0);
            }
        }
        else update(topA,0);

        if (topB==0){
            if (pre[topA]==0 && f2[topA]>=0) ans=f[topA];
            else ans=-1;
        }
        else{
            if (pre[topA]==suf[topB] && f2[topA]>=0 && f4[topB]>=0){
                ans=max(f[topA],f3[topB]);
            }
            else ans=-1;
        }
        printf("%d%c",ans,i==n?'\n':' ');
    }
    return 0;
}
```

## F-Economic Difficulties

**题意: **一共 $n$ 个机器，上下有两棵以 $1$ 为根的树，叶子节点与机器相连，保证对于任意子树，它管辖的机器的编号是一个连续段，问最多可以删掉多少条边，使得每个机器最少跟一棵树的根节点相连。
**思路：**重要性质是<strong>对于任意子树，它管辖的机器的编号是一个连续段</strong>，所以我们可以直接 $dp$，定义 $dp[i]$ 为前 $i$ 的节点都能跟根节点相连最多可以删的边数，转移方程就是$dp[i]=max(dp[j]+max(upcost(j+1,i),downcost(j+1,i)))$，$cost(l,r)$ 定义的是编号 $[l,r]$ 不与根节点相连最多可以删掉多少条边，对于 $cost$ 的话因为有那个性质，所以每个节点管辖的区间可以最多删除节点为根的子树大小条边，这样也不会影响到其他编号的节点，一棵树里删了另一个树没删就行，所以取 $max$，时间复杂度 $O(n^2)$。
**代码：**

```cpp
#include<bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=2000+10;
int n,a,i,j,p,dp[N],val[2][N][N],L[2][N],R[2][N],sz[2][N];
vector<int> G[2][N];
void dfs(int u,int tp){
    if (u>1) sz[tp][u]=1;// 根节点往上没有边了
    for (int i=0;i<(int)G[tp][u].size();++i){
        int v=G[tp][u][i];
        dfs(v,tp);
        L[tp][u]=min(L[tp][u],L[tp][v]);
        R[tp][u]=max(R[tp][u],R[tp][v]);
        sz[tp][u]+=sz[tp][v];
    }
    val[tp][L[tp][u]][R[tp][u]]=sz[tp][u];
}
int main(){
    read(n);
    for (i=0;i<2;++i){
        read(a);
        for (j=2;j<=a;++j){
            read(p);
            G[i][p].push_back(j);
        }
        for (j=1;j<=a;++j) L[i][j]=a+1,R[i][j]=0;
        for (j=1;j<=n;++j){
            read(p);
            L[i][p]=R[i][p]=j;
        }
    }
    dfs(1,0),dfs(1,1);
    for (i=1;i<=n;++i){
        for (j=0;j<i;++j){
            dp[i]=max(dp[i],dp[j]+max(val[0][j+1][i],val[1][j+1][i]));
        }
    }
    printf("%d\n",dp[n]);
    return 0;
}
```