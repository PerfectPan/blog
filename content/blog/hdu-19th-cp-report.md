---
date: 2019-04-02
title: 杭州电子科技大学第十九届程序设计竞赛 解题报告
description: 必备信息搜索技能
tag:
  - Binary Search
  - DP
  - BFS
  - Game Theory
---
## 一些记录
- 过题数：$6/9$（已补完）
- 排名：$15/367$
- 反思：题目一定要看对，交之前要确认数组大小这些没有开小，遇到没人做的题也要积极思考。

---
### 1001.电子锁
- 题意：比较两个字符串是否相等，不一样的匹配条件是$O==0$,$l==I$也算匹配成功。
- 思路：按题目要求模拟即可。
```cpp
#include <bits/stdc++.h>
#define PB emplace_back
#define MP make_pair
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
int T,n;
char s[N],s2[N];
int main(){
    for (read(T);T--;){
        read(n);
        scanf("%s%s",s+1,s2+1);
        bool flag=1;
        for (int i=1;i<=n;++i){
            if (s[i]!=s2[i]){
                if ((s[i]=='O' && s2[i]=='0')||(s2[i]=='O' && s[i]=='0')||((s[i]=='l' && s2[i]=='I')||(s[i]=='I' && s2[i]=='l'))) continue;
                flag=0;
                break;
            }
        }
        if (flag) puts("OK");
        else puts("NO");
    }
    return 0;
}
```

---
### 1002.艺术台阶
- 题意：给一个长度为$n(1\le n\le 2000)$的数组填数，告诉你每个位置能填$[0,a_i]$,你会在其中等概率随机一个数$h_i$作为这个位置的数，合法的数组是$h_1< h_2< \cdots < h_n$，问随机一个数组，合法的概率是多少。
- 思路：非常妙的东西..直接贴题解了。
[![](https://i.loli.net/2019/04/02/5ca2c65c45fa0.png)](https://i.loli.net/2019/04/02/5ca2c65c45fa0.png)
```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0' || ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=2000+10;
const int P=1e9+7;
int T,n,i,j,fm,a[N],tmp[N],f[N],inv[N];
int fexp(int a,int n){
    int res=1;
    while (n){
        if (n&1) res=1LL*res*a%P;
        a=1LL*a*a%P;
        n>>=1;
    }
    return res;
}
inline void up(int&a,int b){a+=b;if(a>=P)a-=P;}
void integration(int a[],int n){
    for (int i=1;i<=n;++i) tmp[i]=1LL*a[i-1]*inv[i]%P;
    tmp[0]=0;
    for (int i=0;i<=n;++i) a[i]=tmp[i];
}
int getValue(int a[],int n,int x){
    int res=0,t=1;
    for (int i=0;i<=n;++i){
        up(res,1LL*t*a[i]%P);
        t=1LL*t*x%P;
    }
    return res;
}
int main(){
    for (inv[1]=1,i=2;i<=2001;++i){
        inv[i]=-1LL*(P/i)*inv[P%i]%P;
        if (inv[i]<0) inv[i]+=P;
    }
    for (read(T);T--;){
        read(n);
        memset(f,0,sizeof(f));
        for (fm=i=1;i<=n;++i){
            read(a[i]);
            fm=1LL*fm*a[i]%P;
        }
        for (i=n-1;i>=1;--i) a[i]=min(a[i],a[i+1]);
        int len=0;
        for (f[0]=1,i=n-1;i>=1;--i){
            len+=1;
            integration(f,len);
            int val=getValue(f,len,a[i+1]);
            for (j=0;j<=len;++j) f[j]=f[j]>0?P-f[j]:0;
            up(f[0],val);
        }
        len+=1;
        integration(f,len);
        printf("%d\n",1LL*getValue(f,len,a[1])*fexp(fm,P-2)%P);
    }
    return 0;
}
```

---
### 1003. 交通灯
- 题意：$n$个点$m$条边的无向图($1\le n,m\le 100000$)，要求给边黑白染色，求满足一点连接的所有边颜色不同的方案数，对$1e9+7$取模。
- 思路：容易发现一个点度数大于$2$的时候就一定不存在方案，然后点度数小于等于$2$的时候可以直接转成点转成边，边转成点，问题就变成了判断这个图是不是二分图，黑白染色判断后是二分图答案乘$2$，否则为$0$即可。
```cpp
#include <bits/stdc++.h>
#define PB push_back
#define MP make_pair
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
const int P=1e9+7;
int T,n,m,i,u,v,flag,col[N],deg[N];
vector<pair<int,int> >G[N];
vector<int>G2[N];
int fexp(int a,int n){
    int res=1;
    while (n){
        if (n&1) res=1LL*res*a%P;
        a=1LL*a*a%P;
        n>>=1;
    }
    return res;
}
void dfs(int x,int color){
    col[x]=color;
    for (int i=0;i<(int)G2[x].size();++i){
        int v=G2[x][i];
        if (col[v]==0) dfs(v,3-color);
        else if (col[v]==color){
            flag=1;
        }
    }
}
int main(){
    for (read(T);T--;){
        read(n),read(m);
        for (i=1;i<=n;++i) G[i].clear(),deg[i]=0;
        for (i=1;i<=m;++i){
            read(u),read(v);
            G[u].PB(MP(v,i));
            G[v].PB(MP(u,i));
            deg[u]+=1,deg[v]+=1;
        }
        flag=0;
        for (i=1;i<=n;++i){
            if (deg[i]>2){
                flag=1;
                break;
            }
        }
        if (flag){
            puts("0");
            continue;
        }
        int ans=1;
        for (i=1;i<=n;++i)if(deg[i]>0){
            if (deg[i]==2){
                int A=G[i][0].second,B=G[i][1].second;
                G2[A].PB(B);
                G2[B].PB(A);
            }
        }
        for (i=1;i<=m;++i)if(col[i]==0){
            flag=0;
            dfs(i,1);
            if (flag) ans=0;
            else ans=2LL*ans%P;
        }
        printf("%d\n",ans);
        for (i=1;i<=m;++i) G2[i].clear(),col[i]=0;
    }
    return 0;
}
```

---
### 1004.老虎机
- 题意：给你一个长度不超过$100000$的数组$a$，你初始手上有$k$元钱$(k\le 1e18)$，每次选择$k\bmod n$的位置，并把$k$加上$a[k\mod n]$，然后进行下一轮直到$k<0$停止，问需要进行几轮，如果可以无法停止，则输出$-1$。
- 思路：因为数组长度有限，所以在经过不超过$n$轮后我们一定会进入一个循环，我们需要把这个环扣出来。假设这个环走完以后消耗$t$元，走环的过程中钱减少量的最大值为$m$，有两种情况，首先我们确定走到这一轮开始之前的钱数为$k$，一种是$t>=0$时，游戏肯定能一直进行下去，否则我们需要找到最大的$roundTimes$使得$m\le k-t\times roundTimes$，那么走完以后肯定还是大于等于$0$的，接下来模拟一遍就可以了，代码中因为解这个方程有一些问题所以放缩了范围，最后让它走了两轮。
```cpp
#include <bits/stdc++.h>
#define PB push_back
#define MP make_pair
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
int T,i,n,a[N];
bool vis[N];
ll k,t,tag[N],val[N],pre[N];
vector<int>vec;
int main(){
    for (read(T);T--;){
        read(n),read(k);
        for (i=0;i<n;++i) read(a[i]),vis[i]=0,pre[i]=0;
        int st=k%n;
        ll step=0,res=0;
        for (;;){
            res+=a[st];
            vis[st]=1;
            step+=1;
            if (k+res<0) break;
            int nxt=(k+res)%n;
            pre[nxt]=st;
            if (vis[nxt]) break;
            st=nxt;
        }
        if (k+res<0) printf("%lld\n",step);
        else{
            for (i=0;i<n;++i) vis[i]=0;
            vec.clear();
            vec.PB(a[st]);
            ll t=a[st];
            for (;;){
                vis[st]=1;
                st=pre[st];
                if (vis[st]) break;
                t+=a[st];
                vec.PB(a[st]);
            }
            if (t>=0){
                puts("-1");
                continue;
            }
            k+=res;
            k-=t;
            ll mn=2e18,x=0;
            reverse(vec.begin(),vec.end());
            for (i=0;i<(int)vec.size();++i){
                x+=vec[i];
                mn=min(mn,x);
            }
            ll roundTimes=(abs(mn)-k)/t;
            step+=(roundTimes-1)*(int)vec.size();
            k+=roundTimes*t;
            if (k<0) printf("%lld\n",step);
            else{
                for (i=0;i<(int)vec.size();++i){
                    k+=vec[i];
                    step+=1;
                    if (k<0) break;
                }
                for (i=0;i<(int)vec.size();++i){
                    k+=vec[i];
                    step+=1;
                    if (k<0) break;
                }
                printf("%lld\n",step);
            }
        }
    }
    return 0;
}
```

---
### 1005.商业竞争
- 题意：有个$n(n\le 500)$个物品，价值为$a_i\times k+b_i$，$k$是你在$[l,r](1\le l\le r\le 1e6)$中指定的，每个物品占用体积为$w_i$，背包大小为$m(m\le 500)$，确认完$k$以后物品会尽可能的装进背包里使价值最大，你要做的是找到这个$k$使得这个最大的价值最小。
- 思路：一个物品的价值关于时间$k$的表达式为$k\times a_i + b_i$ ,所以选择若干个物品的方案的总价值关于时间$k$的表达式也是$k\times a + b$的形式。将所有$O(2^n )$个可能的方案的函数画在坐标系里,$x$轴表示时间,$y$轴表示价值,则每天的最大价值关于$k$是一个下凸函数。现在问题变为:在$[l, r]$内找到一个$k$,使得下凸函数的值最小,三分查找$k$即可。知道$k$后,计算最大价值则是经典$01$背包问题，时间复杂度$O(nmlogr)$。
```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0' || ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=500+10;
int T,n,m,l,r,i;
ll a[N],b[N],w[N],dp[N];
ll calc(int k){
    memset(dp,0,sizeof(dp));
    int i,j;
    for (i=1;i<=n;++i){
        ll val=k*a[i]+b[i];
        for (j=m;j>=w[i];--j){
            dp[j]=max(dp[j],dp[j-w[i]]+val);
        }
    }
    return dp[m];
}
int main(){
    for (read(T);T--;){
        read(n),read(m),read(l),read(r);
        for (i=1;i<=n;++i) read(a[i]),read(b[i]),read(w[i]);
        int L=l,R=r;
        while (R-L>8){
            int midl=L+(R-L)/3;
            int midr=L+(R-L)*2/3;
            if (calc(midl)<=calc(midr)) R=midr;
            else L=midl;
        }
        ll ans=1e18;
        for (i=L;i<=R;++i) ans=min(ans,calc(i));
        printf("%lld\n",ans);
    }
    return 0;
}
```

---
### 1006.自动驾驶系统
- 题意：$n\times m(1\le n,m\le50)$的方格，刚开始方格没有障碍物，有$q(q\le 100000)$次询问，第一种询问是问从$(1,1)$走到$(x,y)$需要走多少步，走是可以上下左右的走，走不到输出$-1$，第二种询问是将$(x,y)$这个位置变成障碍物，保证每个格子不会被重复变成障碍格多次。
- 思路：考虑到每个格子不会被重复变成障碍格多次，所以每次遇到询问$2$的时候就暴力$bfs$预处理出答案即可，时间复杂度$O(n^2m^2+q)$。
```cpp
#include <bits/stdc++.h>
#define PB push_back
#define MP make_pair
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=50+10;
const int P=1e9+7;
int T,n,m,q,x,y,i,j,f[N][N];
int dir_x[]={0,1,0,-1};
int dir_y[]={1,0,-1,0};
bool vis[N][N];
char s[N];
void work(){
    for(int i=0;i<=n;++i)for(int j=0;j<=m;++j)f[i][j]=1e9;
    queue<pair<int,int> >Q;
    f[1][1]=0;
    Q.push(MP(1,1));
    while (!Q.empty()){
        pair<int,int> x=Q.front();Q.pop();
        for (int i=0;i<4;++i){
            int tx=dir_x[i]+x.first;
            int ty=dir_y[i]+x.second;
            if (tx<1 || tx>n || ty<1 || ty>m || vis[tx][ty] || f[tx][ty]<1e9) continue;
            f[tx][ty]=min(f[tx][ty],f[x.first][x.second]+1);
            Q.push(MP(tx,ty));
        }
    }
}
int main(){
    for (read(T);T--;){
        read(n),read(m),read(q);
        for (i=1;i<=n;++i) for (j=1;j<=m;++j) vis[i][j]=0;
        work();
        for (;q--;){
            scanf("%s%d%d",s,&x,&y);
            if (s[0]=='?'){
                printf("%d\n",f[x][y]>=1e9?-1:f[x][y]);
            }
            else{
                vis[x][y]=1;
                work();
            }
        }
    }
    return 0;
}
```

---
### 1007.数据恢复
- 题意：有一个长度为$n(n\le 100000)$的序列$a$，随机一个数$k$异或上$a$以后打乱变成$b$，现在告诉你序列$a$和$b$，求最小的满足要求的$k$，数据全部随机生成。
- 思路：考虑到数据随机生成就开始乱搞了（雾），$n$为奇数，直接异或起来就是$k$了，$n$为偶数，因为数据随机所以肯定只有一个$k$是满足的，而且$a_i$都是不相同的，且其他不符合的$k$基本上对大部分$a_i$都找不到对应的$b_i$，所以对$a_1$枚举$b_i$，异或成$k$然后去$check$即可，复杂度玄学。
```cpp
#include <bits/stdc++.h>
#define PB push_back
#define MP make_pair
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
const int P=1e9+7;
int T,n,i,j,k,ans,a[N],b[N];
map<int,int>mp;
int fexp(int a,int n){
    int res=1;
    while (n){
        if (n&1) res=1LL*res*a%P;
        a=1LL*a*a%P;
        n>>=1;
    }
    return res;
}
int main(){
    for (read(T);T--;){
        read(n);
        for (ans=2e9,i=1;i<=n;++i) read(a[i]);
        for (i=1;i<=n;++i) read(b[i]);
        if (n&1){
            for (k=0,i=1;i<=n;++i) k^=a[i]^b[i];
            printf("%d\n",k);
        }
        else{
            set<int>S;
            for (i=1;i<=n;++i) S.insert(b[i]);
            for (i=1;i<=n;++i){
                int k=a[1]^b[i];
                if (k>=ans) continue;
                bool flag=1;
                for (j=2;j<=n;++j){
                    int tar=k^a[j];
                    if (S.find(tar)==S.end()){
                        flag=0;
                        break;
                    }
                }
                if (flag){
                    ans=k;
                    break;
                }
            }
            printf("%d\n",ans);
        }
    }
    return 0;
}
```

---
### 1008.三色抽卡游戏
- 题意：你和朋友玩三色抽卡游戏，有$n$堆牌，颜色为红绿蓝中的一种，你每次只能选择红色和绿色的牌堆抽不少于$1$张数量的牌，你的朋友只能选择蓝色和绿色的牌堆抽不少于$1$张数量的牌，谁抽走最后一张卡胜出，问你先手必胜还是必败。
- 思路：
	- 因为红卡和蓝卡只有一方能取,所以可以将红卡合并成一堆(记为$A$张),蓝卡也可以合并成一堆(记为$B$张)。
	- 如果$A > B$,那么先手只要不断去拿绿卡。无论最后一张绿卡被谁拿走,在绿卡耗尽后。先手总可以每次只拿一张红卡。因为$A > B$,所以$B$先耗尽,先手必胜。
	- 如果$A < B$,类似地分析可以得到先手必败。
	- 如果$A = B$,那么双方都会优先拿绿卡,谁拿走最后一张绿卡谁就占了优势,这就变成了关于绿卡的一个$Nim$游戏,判断绿卡组的异或和是否为$0$即可。
```cpp
#include <bits/stdc++.h>
#define PB emplace_back
#define MP make_pair
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
int T,n,i,a,b,c,x;
char s[N];
int main(){
    for (read(T);T--;){
        read(n);
        for (a=b=c=0,i=1;i<=n;++i){
            scanf("%s%d",s,&x);
            if (s[0]=='G') c^=x;
            else if (s[0]=='R') a+=x;
            else b+=x;
        }
        if (c==0){
            if (a>b) puts("YES");
            else puts("NO");
        }
        else{
            if (a>=b) puts("YES");
            else puts("NO");
        }
    }
    return 0;
}
```

---
### 1009.质数串
- 题意：一个数字串是''质数串''，当且仅当它的每个非空连续子串表示的数字都是质数。给定一个长度为$n(n\le 100000)$的数字串S，请统计它有多少个非空连续子串是质数串。注意两个子串如果位置不同也算不同，比如$"373373"$中，$"373"$要算入答案两次。
- 思路：“质数串” 的定义条件非常苛刻,可以发现满足条件的只有$2,3,5,7,23,37,53,73,373$，所以检查$S$的每个长度不超过$3$的子串即可。
```cpp
#include <bits/stdc++.h>
#define PB emplace_back
#define MP make_pair
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0' && ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
int T,i,j,len;
char s[N];
bool isPrime(ll x){
    ll m=sqrt(x+0.5);
    for (ll i=2;i<=m;++i){
        if (x%i==0) return 0;
    }
    return 1;
}
int main(){
    for (read(T);T--;){
        read(len);
        scanf("%s",s+1);
        ll ans=0;
        for (i=1;i<=len;++i){
            int res=0;
            for (j=i;j<=min(i+4,len);++j){
                if (s[j]=='1' || s[j]=='4' || s[j]=='6' || s[j]=='8' || s[j]=='9') break;
                if (j>i && s[j]==s[j-1]) break;
                res=res*10+s[j]-'0';
                if (isPrime(res)) ans++;
                else break;
            }
        }
        printf("%lld\n",ans);
    }
    return 0;
}
```