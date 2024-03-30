---
date: 2018-05-22
title: 2018 计蒜之道 第三场 贝壳找房户外拓展（中等）
description: 2018 计蒜之道 第三场 贝壳找房户外拓展（中等）
tag:
  - Sweep Line
  - Segment Tree
---

**题目链接**：[https://nanti.jisuanke.com/t/27118](https://nanti.jisuanke.com/t/27118)

**题意**：略。

**思路**：查询操作放最后提示我们可以用离线的算法。删除操作其实相当于没有，因为我们可以弄个标记数组去标记某个操作是否失效。考虑扫描线去解决这个问题，对于更新操作，简单来说就是二维平面平行于 $x$ 轴的一条线段 $[L,R]$ 同时赋值 $p$ 和 $q$，那么我们可以在 $L$ 这一处打一个赋值标记，在 $R+1$ 这一处打一个清除标记，扫描线扫到 $L$ 这个点并进行更新后，相当于到后面 $R$ 为止都是生效的，本质是差分的思想。然后考虑查询操作，注意到每次是 $x=p_i\times x+q_i$，假设一开始在 $L$ 这个位置走过以后变成$p_L\times x+q_L$，那么走到 $L+1$ 的时候，$x=p_{L+1}\times (p_L\times x+q_L)+q_{L+1}$，带入后, $P=p_{L+1}\times p_L$, $Q=p_{L+1}\times q_L+q_{L+1}$，即发现从左到右我们是可以$O(1)$ 合并信息的，所以我们可以用线段树维护 $y$ 轴上区间系数 $P$ 和 $Q$ 的值，清除标记相当于 $p=1,q=0$，然后就是线段树单点更新区间查询的操作了，这样问题就解决了。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<'0'||ch>'9') f|=(ch=='-'),ch=getchar();
    while (ch>='0'&&ch<='9') x=x*10+ch-'0',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
const int MOD=323232323;
struct OP{int tp,pos,p,q,id;};
int n,m,qq,i,j,cnt,pos,l,r,y,c,d,P,Q,id,ans[N],p[N<<2],q[N<<2];
bool vis[N];
char s[2];
vector<OP>G[N];
#define lson root<<1,l,mid
#define rson root<<1|1,mid+1,r
void pushup(int root){
    p[root]=1LL*p[root<<1]*p[root<<1|1]%MOD;
    q[root]=(1LL*p[root<<1|1]*q[root<<1]%MOD+q[root<<1|1])%MOD;
}
void build(int root,int l,int r){
    p[root]=1,q[root]=0;
    if (l==r) return;
    int mid=l+((r-l)>>1);
    build(lson);
    build(rson);
}
void add(int root,int l,int r,int pos,int pp,int qq){
    if (l==r){
        p[root]=pp;
        q[root]=qq;
        return;
    }
    int mid=l+((r-l)>>1);
    if (pos<=mid) add(lson,pos,pp,qq);
    else add(rson,pos,pp,qq);
    pushup(root);
}
void query(int root,int l,int r,int L,int R){
    if (L<=l&&r<=R){
        P=P*p[root]%MOD;
        Q=(1LL*p[root]*Q%MOD+q[root])%MOD;
        return;
    }
    int mid=l+((r-l)>>1);
    if (L<=mid) query(lson,L,R);
    if (mid<R) query(rson,L,R);
    pushup(root);
}
int main(){
    read(n),read(m),read(qq);
    for (;qq--;){
        scanf("%s",s);
        if (s[0]=='I'){
            cnt++;
            read(l),read(r),read(y),read(c),read(d);
            G[l].push_back((OP){1,y,c,d,cnt});
            G[r+1].push_back((OP){1,y,1,0,cnt});
        }
        else if (s[0]=='D'){
            read(pos);
            vis[pos]=1;
        }
        else{
            ++id;
            read(y),read(l),read(r);
            G[y].push_back((OP){2,id,l,r,0});
        }
    }
    build(1,1,m);
    for (i=1;i<=n;i++){
        for (j=0;j<(int)G[i].size();j++){
            OP cur=G[i][j];
            if (cur.tp==1){
                if(!vis[cur.id]) add(1,1,m,cur.pos,cur.p,cur.q);
            }
            else{
                P=1,Q=0;
                query(1,1,m,cur.p,cur.q);
                ans[cur.pos]=Q;
            }
        }
    }
    for (i=1;i<=id;i++) printf("%d\n",ans[i]);
    return 0;
}
```
