---
date: 2018-04-06
title: Codeforces 786A Berzerk
description: Codeforces 786A Berzerk
tag:
  - Number Theory
  - BFS
---

**题目链接**：[http://codeforces.com/contest/786/problem/A](http://codeforces.com/contest/786/problem/A)

**题意**：有 $n$ 个点排成一个环，$1$ 号点是一个黑洞，有个怪物在其中的某个点上，$Alice$ 和 $Bob$ 轮流从自己的集合中拿一个数 $x$ 出来让怪物顺时针走 $x$ 步，如果某个人操作完以后这个怪物走进了黑洞那么这个人就赢了，假设两个人都足够聪明，对于每个位置每个人先手的情况输出对应的结局(赢，输，平局)。

**思路**：这是一个不平等的博弈，它与公平组合游戏的区别就是玩家每一步的可移动到的状态是不同的，题目中两个玩家的集合里的数不同所以可以移动到的下一个状态也是不同的，对于不平等的博弈我们设定的状态要是当前的游戏局面以及轮到谁走了，貌似也是适用必胜必败态的，解这类博弈好像会用到超自然数什么东西且 $SG$ 定理在这里是失效的，但具体的论文还没看，这里主要是用到了必胜必败态。回到本题，我们还注意到这个游戏也是一个有可能无法终止的博弈，对于解决这类博弈我们的技巧就是找到停止的状态，然后反向 $BFS$ 或者 $DFS$ 标记状态，如果当前点是必败态，那么反向能走到的所有状态就是必胜态，如果当前点是必胜态，考虑反向走到的点的度数，如果这个点的后继有一个必胜态，度数就减一，如果为 $0$ 了就说明这个点的后继状态全是必胜态，那么这个点就是必败态了，最后到不了的没有被标记的状态无疑就是平局的状态了，这样问题就解决了。


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
const int N=7000+10;
const int LOOP=0;
const int WIN=1;
const int LOSE=2;
int n,i,k[2],s[N][2],dp[N][2],deg[N][2];
bool vis[N][2];
struct Node{
	int pos,who,sta;
};
int main(){
	read(n);
	for (read(k[0]),i=1;i<=k[0];i++) read(s[i][0]);
	for (read(k[1]),i=1;i<=k[1];i++) read(s[i][1]);
	for (i=0;i<n;i++){
		deg[i][0]=k[0];
		deg[i][1]=k[1];
	}
	dp[0][0]=dp[0][1]=LOSE;
	vis[0][0]=vis[0][1]=1;
	queue<Node>Q;
	Q.push((Node){0,0,LOSE});
	Q.push((Node){0,1,LOSE});
	while (!Q.empty()){
		Node cur=Q.front();Q.pop();
		int turn=cur.who^1;
		if (cur.sta==LOSE){
			for (i=1;i<=k[turn];i++){
				int nxt=(cur.pos-s[i][turn]+n)%n;
				if (!vis[nxt][turn]){
					vis[nxt][turn]=1;
					dp[nxt][turn]=WIN;
					Q.push((Node){nxt,turn,WIN});
				}
			}
		}
		else{
			for (i=1;i<=k[turn];i++){
				int nxt=(cur.pos-s[i][turn]+n)%n;
				deg[nxt][turn]--;
				if (deg[nxt][turn]==0&&!vis[nxt][turn]){
					vis[nxt][turn]=1;
					dp[nxt][turn]=LOSE;
					Q.push((Node){nxt,turn,LOSE});
				}
			}
		}
	}
	for (int player=0;player<2;player++){
		for (i=1;i<n;i++){
			if (dp[i][player]==LOOP) printf("Loop ");
			else if (dp[i][player]==WIN) printf("Win ");
			else printf("Lose ");
		}
		puts("");
	}
	return 0;
}
```
