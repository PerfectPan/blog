---
date: 2017-10-28
title: Wannafly 挑战赛2 B-Travel
description: Wannafly 挑战赛2 B-Travel
tag:
  - Shortest Path
---

**题目链接**：[https://www.nowcoder.com/acm/contest/17/B](https://www.nowcoder.com/acm/contest/17/B)

**题意**：略。

**思路**：考虑如果没有建传送门，我们可以直接从 $u$ 到 $v$ 的路径无非就两条，我们可以预处理前缀和然后 $O(1)$ 查询，建立了传送门后，注意到传送门的边数很少，小于等于 $20$,所以我们可以对每个关键点跑最短路预处理出每个关键点到其他所有点的最短路，然后查询的时候直接枚举每个关键点更新答案即可。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
const ll INF=2000000000000000000LL;
const int maxn=100005+5;
int n,m,Q,x,y,u,v;
ll d[maxn],p[maxn],id[41],w;
vector<int>vec;
struct Edge{
    int to;
    ll dist;
};
struct HeapNode{
    ll d;
    int u;
    bool operator <(const HeapNode& rhs)const{
        return d>rhs.d;
    }
};
struct Dijkstra{
    int n,m;
    vector<Edge>edges;
    vector<int>G[maxn];
    bool done[maxn];
    ll d[41][maxn];

    void init(int n){
        this->n=n;
        for (int i=0;i<=n;i++) G[i].clear();
        edges.clear();
    }

    void AddEdge(int from,int to,int dist){
        edges.push_back((Edge){to,dist});
        m=edges.size();
        G[from].push_back(m-1);
    }

    void dijkstra(int s){
        priority_queue<HeapNode>Q;
        int st=id[s];
  //      cout<<st<<endl;
        for (int i=1;i<=n;i++) d[s][i]=INF;
        d[s][st]=0;
        memset(done,false,sizeof(done));
        Q.push((HeapNode){0,st});
        while (!Q.empty()){
            HeapNode x=Q.top();Q.pop();
            int u=x.u;
            if (done[u]) continue;
            done[u]=true;
            for (int i=0;i<(int)G[u].size();i++){
                Edge &e=edges[G[u][i]];
                if (d[s][e.to]>d[s][u]+e.dist){
                    d[s][e.to]=d[s][u]+e.dist;
                    Q.push((HeapNode){d[s][e.to],e.to});
                }
            }
        }
    }
}solver;
int main(){
    scanf("%d%d",&n,&m);
    solver.init(n);
    for (int i=1;i<=n;i++){
        scanf("%lld",&d[i]);
        solver.AddEdge(i,i%n+1,d[i]);
        solver.AddEdge(i%n+1,i,d[i]);
    }
    for (int i=1;i<=m;i++){
        scanf("%d%d%lld",&u,&v,&w);
        solver.AddEdge(u,v,w);
        solver.AddEdge(v,u,w);
        vec.push_back(u),vec.push_back(v);
    }
    for (int i=1;i<=n;i++){
        if (i==1) p[i]=d[n];
        else p[i]+=p[i-1]+d[i-1];
    }
    int len=unique(vec.begin(),vec.end())-vec.begin();
    for (int i=1;i<=len;i++){
        id[i]=vec[i-1];
        solver.dijkstra(i);
    }
 //   printf("%d\n",solver.d[1][4]);
    for (scanf("%d",&Q);Q--;){
        scanf("%d%d",&x,&y);
        ll ans=abs(p[y]-p[x]);
        ans=min(ans,p[n]-ans);
        for (int i=1;i<=len;i++){
            ans=min(ans,solver.d[i][x]+solver.d[i][y]);
        }
        printf("%lld\n",ans);
    }
    return 0;
}

```
