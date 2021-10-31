---
date: 2019-12-14
title: Codeforces Round#605(Div. 3) D/E/F 题解
description: Codeforces Round#605(Div. 3) D/E/F 题解
tag:
  - DP
  - BFS
  - Constructive Algorithm
---

- 比赛地址：[https://codeforces.com/contest/1272](https://codeforces.com/contest/1272)

---

## D - Remove One Element
**题意**：给一个数组，求最长连续递增的子数组长度，可以删掉最多一个元素。

**思路**：预处理出 $L[i]$ 为以 $i$ 结尾往前最长的连续递增的子数组长度，$R[i]$ 为以 $i$ 开头往后最长的连续递增的子数组长度，然后枚举被删除的位置 $i$，如果 $a[i-1]< a[i+1]$，则更新答案 $L[i-1]+R[i+1]$ 即可，时间复杂度 $O(n)$。

**代码**：
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
const int N=2e5+10;
int n,i,res=1,a[N],l[N],r[N];
int main(){
    read(n);
    for (i=1;i<=n;++i) read(a[i]);
    for (l[1]=1,i=2;i<=n;++i){
        if (a[i]>a[i-1]){
            l[i]=l[i-1]+1;
            res=max(res,l[i]);
        }
        else l[i]=1;
    }
    for (r[n]=1,i=n-1;i>=1;--i){
        if (a[i]<a[i+1]) r[i]=r[i+1]+1;
        else r[i]=1;
    }
    for (i=2;i<=n-1;++i){
        if (a[i+1]>a[i-1]) res=max(res,l[i-1]+r[i+1]);
    }
    printf("%d\n",max(r[1],res));
    return 0;
}
```

---

## E - Nearest Opposite Parity
**题意**：$n$ 个位置，位置 $i$ 可以跳到 $i-a[i]$ 或 $i+a[i]$，如果跳的位置不在 $[1,n]$ 的范围内则不可以跳，问从位置 $i$ 出发经过最少步数达到与 $a[i]$ 奇偶性相反的位置。

**思路**：建出反图，然后先把所有奇数位置的扔进队列里同时进行 $bfs$，这样所有 $a[i]$ 为偶数的最短距离就是它们最先碰到的奇数的距离，对于奇数同理，时间复杂度 $O(n+m)$，$m$ 为建图的边数。

**代码**：
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
const int N=2e5+10;
int n,i,d,a[N],dis[N],ans[N];
vector<int>G[N],G2[N];
queue<pair<int,int> >Q;
int main(){
    read(n);
    for (i=1;i<=n;++i) read(a[i]);
    for (i=1;i<=n;++i){
        if (i-a[i]>=1) G[i-a[i]].push_back(i);
        if (i+a[i]<=n) G[i+a[i]].push_back(i);
    }
    for (d=0;d<2;++d){
        memset(dis,-1,sizeof(dis));
        queue<int>Q;
        for (i=1;i<=n;++i)if((a[i]&1)==d){
            dis[i]=0;
            Q.push(i);
        }
        while (!Q.empty()){
            int u=Q.front();Q.pop();
            for (i=0;i<(int)G[u].size();++i){
                int v=G[u][i];
                if (dis[v]==-1){
                    dis[v]=dis[u]+1;
                    Q.push(v);
                }
            }
        }
        for (i=1;i<=n;++i)if((a[i]&1)!=d){
            ans[i]=dis[i];
        }
    }
    for (i=1;i<=n;++i) printf("%d%c",ans[i],i==n?'\n':' ');
    return 0;
}
```

---

## F - Two Bracket Sequences

**题意**：给两个括号序列 $S$ 和 $T$，构造最短的合法括号序列使得其中包含 $S$ 和 $T$ 两个子序列。

**思路**：定义 $f[i][j][k]$ 为匹配 $S$ 前 $i$ 个字符，$T$ 前 $j$ 个字符，当前构造的括号序列 $balance$ 为 $k$ 的最短长度，转移就是枚举添加的是 $'('$还是$')'$，顺便记录一下转移的位置然后还原即可，时间复杂度 $O(n^3)$。

**代码**：
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
const int N=200+5;
struct State{
    int x,y,k;
    char s;
};
int i,j,k,ls,lt,dp[N][N][N<<1];
State p[N][N][N<<1];
char s[N],t[N];
int main(){
    scanf("%s%s",s+1,t+1);
    ls=strlen(s+1),lt=strlen(t+1);
    for(i=0;i<=ls;++i)for(j=0;j<=lt;++j)for(k=0;k<2*N;++k)dp[i][j][k]=1e9;
    dp[0][0][0]=0;
    for (i=0;i<=ls;++i){
        for (j=0;j<=lt;++j){
            for (k=0;k<2*N;++k)if(dp[i][j][k]!=1e9){
                int nxi=i+(i+1<=ls && s[i+1]=='(');
                int nxj=j+(j+1<=lt && t[j+1]=='(');
                if (k+1<2*N && dp[nxi][nxj][k+1]>dp[i][j][k]+1){
                    dp[nxi][nxj][k+1]=dp[i][j][k]+1;
                    p[nxi][nxj][k+1]=(State){i,j,k,'('};
                }
 
                nxi=i+(i+1<=ls && s[i+1]==')');
                nxj=j+(j+1<=lt && t[j+1]==')');
                if (k>0 && dp[nxi][nxj][k-1]>dp[i][j][k]+1){
                    dp[nxi][nxj][k-1]=dp[i][j][k]+1;
                    p[nxi][nxj][k-1]=(State){i,j,k,')'};
                }
            }
        }
    }
    int pos=0;
    for (k=0;k<2*N;++k){
        if (dp[ls][lt][k]+k<dp[ls][lt][pos]+pos){
            pos=k;
        }
    }
    string res=string(pos,')');
    while (ls>0 || lt>0 || pos!=0){
        int nxi=p[ls][lt][pos].x;
        int nxj=p[ls][lt][pos].y;
        int nxk=p[ls][lt][pos].k;
        res+=p[ls][lt][pos].s;
        ls=nxi;
        lt=nxj;
        pos=nxk;
    }
    reverse(res.begin(),res.end());
    cout<<res<<endl;
    return 0;
}
```