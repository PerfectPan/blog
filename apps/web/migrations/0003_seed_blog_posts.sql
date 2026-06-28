-- One-time seed: import the legacy content/blog/*.md into the D1 post
-- table so the blog is D1-driven (the .md files are removed afterwards).
-- Idempotent via ON CONFLICT DO NOTHING.
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('2016-jisuan', '2016 计蒜之道 初赛 第一场  青云的机房组网方案（困难）', '2016 计蒜之道 初赛 第一场  青云的机房组网方案（困难）', '**题目链接**：[https://nanti.jisuanke.com/t/11135](https://nanti.jisuanke.com/t/11135)

**题意**：略。

**思路**：正难则反，考虑将问题转成树上两两之间距离之和-树上两两不互质点对的距离之和，对于前者，考虑一条边对答案的贡献，即 $sz[u]\times (n-sz[u])$，表示这条边两边选的点对的方案。考虑后者，值域不是很大，一个数的质因子不是很多，可以用容斥定理去算，对于一个因数，是这个因数倍数的点不会很多，把因数当作一个询问，最后的点数大约与 $n$ 同阶，所以把每个因数拉出来建一棵虚树，然后问题转成树上两两之间距离之和，跑一遍 $dfs$ 即可。

```cpp
#include <bits/stdc++.h>
#define PB emplace_back
#define MP make_pair
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=1e5+10;
int n,i,j,u,v,dfs_clock,a[N],primes[N],mu[N],bel[N],fa[N],dep[N],sz[N],son[N],dfn[N];
ll ans,res;
vector<int>G[N],G2[N],fac[N];
void sieve(){
	for (mu[1]=1,i=2;i<=100000;i++){
		if (!primes[i]) primes[++primes[0]]=i,mu[i]=-1;
		for (j=1;j<=primes[0] && i*primes[j]<=100000;j++){
			primes[i*primes[j]]=1;
			if (i%primes[j]==0){
				mu[i*primes[j]]=0;
				break;
			}
			else mu[i*primes[j]]=-mu[i];
		}
	}
}
void dfs(int u,int f){
	fa[u]=f,dep[u]=dep[f]+1,son[u]=-1,dfn[u]=++dfs_clock,sz[u]=1;
	for (int i=0;i<(int)G[u].size();i++){
		int v=G[u][i];
		if (v==f) continue;
		dfs(v,u);
		sz[u]+=sz[v];
		if (son[u]==-1 || sz[v]>sz[son[u]]) son[u]=v;
	}
	ans+=1LL*(n-sz[u])*sz[u];
}
void dfs2(int u,int f){
	bel[u]=f;
	if (son[u]==-1) return;
	dfs2(son[u],f);
	for (int i=0;i<(int)G[u].size();i++){
		int v=G[u][i];
		if (v==fa[u] || v==son[u]) continue;
		dfs2(v,v);
	}
}
int lca(int u,int v){
	for (;bel[u]!=bel[v];dep[bel[u]]>dep[bel[v]]?u=fa[bel[u]]:v=fa[bel[v]]);
	return dep[u]>dep[v]?v:u;
}
void dfs(int u,int f,int tot){
	for (int i=0;i<(int)G2[u].size();i++){
		int v=G2[u][i];
		if (v==f) continue;
		dfs(v,u,tot);
		sz[u]+=sz[v];
	}
	if (f) res+=1LL*abs(dep[u]-dep[f])*sz[u]*(tot-sz[u]);
	G2[u].clear();
}
inline bool cmp(const int&a,const int&b){return dfn[a]<dfn[b];}
void addEdge(int u,int v){
	G2[u].PB(v);
	G2[v].PB(u);
}
ll solve(int val){
	static int points[N],stk[N];
	int cnt=0,top=0;
	for (int i=val;i<=100000;i+=val){
		for (int j=0;j<(int)fac[i].size();j++){
			points[cnt++]=fac[i][j];
			sz[fac[i][j]]=1;
		}
	}
	if (cnt<=1) return 0;
	sort(points,points+cnt,cmp);

	sz[0]=0,stk[top++]=0;
	for (int i=0;i<cnt;i++){
		int u=points[i],f=lca(u,stk[top-1]);
		if (f==stk[top-1]) stk[top++]=u;
		else{
			while (top-2>=0 && dep[stk[top-2]]>=dep[f]){
				addEdge(stk[top-1],stk[top-2]);
				top--;
			}
			if (f!=stk[top-1]){
				addEdge(f,stk[--top]);
				stk[top++]=f,sz[f]=0;//不是关键点的sz应设为0以不影响答案
			}
			stk[top++]=u;
		}
	}

	for (int i=0;i<top-1;i++) addEdge(stk[i],stk[i+1]);
	res=0,dfs(0,0,cnt);
	return res*mu[val];
}
int main(){
	sieve();
	read(n);
	for (i=1;i<=n;i++){
		read(a[i]);
		fac[a[i]].PB(i);
	}
	for (i=1;i<n;i++){
		read(u),read(v);
		G[u].PB(v);
		G[v].PB(u);
	}
	dfs(1,0),dfs2(1,1);
	for (i=2;i<=100000;i++)if(mu[i])ans+=solve(i);
	printf("%lld\n",ans);
	return 0;
}
```', 'public', NULL, 'published', '["Data Structure"]', '2018-09-04T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('2018-jisuan', '2018 计蒜之道 第三场 贝壳找房户外拓展（中等）', '2018 计蒜之道 第三场 贝壳找房户外拓展（中等）', '**题目链接**：[https://nanti.jisuanke.com/t/27118](https://nanti.jisuanke.com/t/27118)

**题意**：略。

**思路**：查询操作放最后提示我们可以用离线的算法。删除操作其实相当于没有，因为我们可以弄个标记数组去标记某个操作是否失效。考虑扫描线去解决这个问题，对于更新操作，简单来说就是二维平面平行于 $x$ 轴的一条线段 $[L,R]$ 同时赋值 $p$ 和 $q$，那么我们可以在 $L$ 这一处打一个赋值标记，在 $R+1$ 这一处打一个清除标记，扫描线扫到 $L$ 这个点并进行更新后，相当于到后面 $R$ 为止都是生效的，本质是差分的思想。然后考虑查询操作，注意到每次是 $x=p_i\times x+q_i$，假设一开始在 $L$ 这个位置走过以后变成$p_L\times x+q_L$，那么走到 $L+1$ 的时候，$x=p_{L+1}\times (p_L\times x+q_L)+q_{L+1}$，带入后, $P=p_{L+1}\times p_L$, $Q=p_{L+1}\times q_L+q_{L+1}$，即发现从左到右我们是可以$O(1)$ 合并信息的，所以我们可以用线段树维护 $y$ 轴上区间系数 $P$ 和 $Q$ 的值，清除标记相当于 $p=1,q=0$，然后就是线段树单点更新区间查询的操作了，这样问题就解决了。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
        if (s[0]==''I''){
            cnt++;
            read(l),read(r),read(y),read(c),read(d);
            G[l].push_back((OP){1,y,c,d,cnt});
            G[r+1].push_back((OP){1,y,1,0,cnt});
        }
        else if (s[0]==''D''){
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
```', 'public', NULL, 'published', '["Sweep Line","Segment Tree"]', '2018-05-22T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('2019ICPC-NanchangG', '2019 ICPC 南昌邀请赛网络赛 G. tsy''s number', '2019 ICPC 南昌邀请赛网络赛 G. tsy''s number', '**题目链接**：[https://nanti.jisuanke.com/t/38226](https://nanti.jisuanke.com/t/38226)

**题意**：求 $\sum_{i=1}^{n}\sum_{j=1}^{n}\sum_{k=1}^{n}\frac{\phi(i)\phi(j^2)\phi(k^3)}{\phi(i)\phi(j)\phi(k)}\phi(gcd(i,j,k))$

**思路**：由欧拉函数性质 $\phi(ab)=\phi(a)\phi(b)\frac{gcd(a,b)}{\phi(gcd(a,b))}$ 得

$$
\sum_{i=1}^{n}\sum_{j=1}^{n}\sum_{k=1}^{n}jk^2\phi(gcd(i,j,k))
$$

按照惯例枚举 $gcd$,得 

$$
\sum_{d=1}^{n}\phi(d)\sum_{i=1}^{n}\sum_{j=1}^{n}\sum_{k=1}^{n}jk^2[gcd(i,j,k)==d]
$$

我们定义 $f(d)=\sum_{i=1}^{n}\sum_{j=1}^{n}\sum_{k=1}^{n}jk^2[gcd(i,j,k)==d]$，$g(d)$ 表示 $d|gcd(i,j,k)$ 的答案，则

$$
g(d)=\sum_{x=1}^{\lfloor\frac{n}{d}\rfloor}f(d * x)
$$

莫比乌斯反演得到

$$
f(d)=\sum_{x=1}^{\lfloor\frac{n}{d}\rfloor}\mu(x)g(d * x)
$$

其中 $g(d * x)=\lfloor\frac{n}{d * x}\rfloor getSum(\lfloor\frac{n}{d * x}\rfloor) getSumSquare(\lfloor\frac{n}{d * x}\rfloor) * (d * x)^3$，所以式子化为

$$
\sum_{d=1}^{n}\phi(d)\sum_{x=1}^{\lfloor\frac{n}{d}\rfloor}\mu(x)g(d * x)
$$

继续按照套路枚举定值 $T=d * x$，式子化为

$$
\sum_{T=1}^{n}g(T)\sum_{d|T}\phi(d)\mu(\frac{T}{d})
$$

$g(T)$ 代入得 

$$
\sum_{T=1}^{n}\lfloor\frac{n}{T}\rfloor getSum(\lfloor\frac{n}{T}\rfloor) getSumSquare(\lfloor\frac{n}{T}\rfloor) * T^3\sum_{d|T}\phi(d)\mu(\frac{T}{d})
$$

，后面 $\phi$ 和 $\mu$ 都是积性函数，狄利克雷卷积以后还是积性函数，可以线性筛预处理，推一下质数和质数的幂的时候对应的值是多少就好了，然后跟 $T^3$ 乘起来求一个前缀和，前面下底整除函数分块求就好了，预处理 $O(n)$，单次查询 $O(\sqrt n)$，时间复杂度 $O(n+T\sqrt n)$，注意模数不是质数，所以没法用费马小定理直接求，在 $getSumSquare(\lfloor\frac{n}{d * x}\rfloor)$ 的时候要除 $6$，可以前面先除 $2$ 然后再用扩展欧几里得求 $3$ 和 $2^{30}$ 的逆元即可，扩欧是可以求互质的逆元的，这样就可以了。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=1e7+10;
const int P=1<<30;
int T,n,ans,i,j,last,primes[N],low[N],f[N];
inline void up(int&a,int b){a+=b;if(a>=P)a-=P;}
void sieve(){
    for (low[1]=f[1]=1,i=2;i<=1e7;++i){
        if (!primes[i]) primes[++primes[0]]=low[i]=i,f[i]=i-2;
        for (j=1;j<=primes[0]&&i*primes[j]<=1e7;++j){
            primes[i*primes[j]]=1;
            if (i%primes[j]==0){
                low[i*primes[j]]=low[i]*primes[j];
                if (low[i]==i) f[i*primes[j]]=f[i]==i-2?1LL*(i-1)*(i-1)%P:1LL*f[i]*primes[j]%P;
                else f[i*primes[j]]=1LL*f[i/low[i]]*f[low[i]*primes[j]]%P;
                break;
            }
            low[i*primes[j]]=primes[j];
            f[i*primes[j]]=1LL*f[i]*f[primes[j]]%P;
        }
    }
    for (i=2;i<=1e7;++i){
        f[i]=1LL*f[i]*i%P*i%P*i%P;
    	up(f[i],f[i-1]);
    }
}
inline int get2(int x){return 1LL*x*(x+1)/2%P;}
inline int get3(int x){return 1LL*x*(x+1)/2%P*(2*x+1)%P*715827883%P;}
int main(){
	sieve();
	while (~scanf("%d",&T)){
		for (;T--;){
			read(n);
			for (ans=0,i=1;i<=n;i=last+1){
				last=n/(n/i);
				int val=f[last]-f[i-1];
				if (val<0) val+=P;
				int A=n/i;
				int B=get2(n/i);
				int C=get3(n/i);
				val=1LL*val*A%P;
				val=1LL*val*B%P;
				val=1LL*val*C%P;
				up(ans,val);
			}
			printf("%d\n",ans);
		}
	}
	return 0;
}
```', 'public', NULL, 'published', '["Number Theory"]', '2019-04-22T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('agc-102D', 'AtCoder Regular Contest 102 D All Your Paths are Different Lengths', 'AtCoder Regular Contest 102 D All Your Paths are Different Lengths', '**题目链接**：[https://arc102.contest.atcoder.jp/tasks/arc102_b](https://arc102.contest.atcoder.jp/tasks/arc102_b)

**题意**：给定一个长度 $L$，构造一个图，满足编号小的向编号大的连边，权值自己设，允许重边，使得一共有 $L$条路，且每条路权值为 $[0,L-1]$ 中的一种且不重复，点数不超过 $20$，边数不超过 $60$。

**思路**：用一个数系去完整的表示 $[0,L-1]$ 中每一个数，很容易想到用 $2$ 进制，那我们先找一个最大的 $n$，满足 $2^n-1<=L-1$，然后连边就很容易了，$i->i+1$ 连两条边权分别为 $0$ 和 $2^{i-1}$ 的边，代表选或不选，这样我们就可以表示出 $[0,2^{n-1}]$ 里所有的数，然后考虑不满的部分，意识流一下应该能调出来。。大概就是考虑 $1010100$ 这么一个数，那么 $10100XX$，即把那一位 $1$ 翻转，则 $XX$ 的部分就是选或不选都可以，所以我们把 $3$ 向 $n$ 连一条权值为 $1010000$ 的边即可，以此类推，最后 $1$ 向 $n$ 连一条 $L-1$ 的边即可。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=20+5;
int L,i,j,m,POW[N];
vector<pair<int,int> >G[N];
int main(){
	read(L);
	int x=1,n=1;
	for (;x<L;x*=2) n++;
	if (x>L) n--;
	for (POW[0]=1,i=1;i<=20;i++) POW[i]=POW[i-1]*2;
	for (int i=1;i<n;i++){
		G[i].PB(MP(i+1,0));
		G[i].PB(MP(i+1,POW[i-1]));
		m+=2;
	}
	if (L>POW[n-1]){
		int tmp=L-1;
		for (i=0;i<n-1;i++){
			if ((L-1)&(1<<i)){
				tmp^=(1<<i);
				G[i+1].PB(MP(n,tmp));
				m++;
			}
		}
		G[1].PB(MP(n,L-1)),m++;
	}
	printf("%d %d\n",n,m);
	for (i=1;i<=n;i++){
		for (j=0;j<(int)G[i].size();j++){
			int v=G[i][j].first,w=G[i][j].second;
			printf("%d %d %d\n",i,v,w);
		}
	}
	return 0;
}
```', 'public', NULL, 'published', '["Constructive Algorithm"]', '2018-09-01T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('arc-100E', 'AtCoder Regular Contest 100 E Or Plus Max', 'AtCoder Regular Contest 100 E Or Plus Max', '**题目链接**：[https://arc100.contest.atcoder.jp/tasks/arc100_c](https://arc100.contest.atcoder.jp/tasks/arc100_c)

**题意**：给你一个长度为 $2^n-1$ 的序列 $a$，要求对每个 $1\le k\le 2^n-1$ 找出最大的 $a_i+a_j(i|j\le k)$。

**思路**：对于每个位置 $k$ 我们求出 $i|j=k$ 的最大的 $a_i+a_j$ 然后求一遍前缀最大值就可以得到每个 $k$ 的答案了，然后对于前面的子问题，不难发现 $i$ 和 $j$ 一定是 $k$ 的子集，所以直接高维前缀和求一遍最大值和次大值即可，时间复杂度 $O(n2^n)$。

```cpp
#include <bits/stdc++.h>
using namespace std;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=(1<<18)+10;
int n,i,j,status,a[N];
pair<int,int> f[N];
inline void up(pair<int,int> &a,pair<int,int> b){
	if (b.second>=a.first){
		a=b;
	}
	else if (b.first>=a.first){
		a.second=a.first;
		a.first=b.first;
	}
	else if (b.first<a.first && b.first>=a.second){
		a.second=b.first;
	}
}
int main(){
	read(n);
	for (i=0;i<(1<<n);++i){
		read(a[i]);
		f[i].first=a[i];
	}
	for (i=0;i<n;++i){
		for (status=0;status<(1<<n);++status){
			if (status&(1<<i)) up(f[status],f[status^(1<<i)]);
		}
	}
	int res=0;
	for (i=1;i<(1<<n);++i){
		res=max(res,f[i].first+f[i].second);
		printf("%d\n",res);
	}
	return 0;
}
```', 'public', NULL, 'published', '["DP"]', '2018-09-11T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('atcoder-petro-001D', 'CodeChef April Challenge 2019 Kira Loves Palindromes', 'CodeChef April Challenge 2019 Kira Loves Palindromes', '**题目链接**：[https://apc001.contest.atcoder.jp/tasks/apc001_d](https://apc001.contest.atcoder.jp/tasks/apc001_d)

**题意**：给你一片森林，$n$ 个点，$m$ 条边，每个节点都有自己的价值 $a_i$，你可以进行若干次操作，每次操作取两个点连一条边，代价是两个点的价值和，且用完以后这两个点就不能再用了，问最小的代价是多少能使整片森林都连接起来，如果不行就输出 $Impossible$。

**思路**: 我们可以认定一开始有 $n$ 个连通块，连了 $m$ 条边后，连通块减少为 $n-m$，那么我们应该最少再连 $n-m-1$ 条边使得整片森林连通，而这需要 $2\times (n-m-1)$ 个顶点，所以如果 $n$ 小于 $2 \times(n-m-1)$ 无疑是没有解的。若有解，我们先在 $n-m$ 个连通块里各选一个价值最小的顶点，保证最后都能连到，那么剩下 $n-m-2$ 个顶点我们只要从小到大的挑就可以了，因为不管怎么样这 $n-m-2$ 个顶点我们总能找到对应的不跟他在一个连通块里的顶点进行连边（有点像二分图连边，自己画画大概就明白了），这样就解决了。

```cpp
const int N=100000+10;
int n,m,i,j,x,y,sz,cnt;
ll a[N],ans;
vector<int>G[N],v[N],res;
bool vis[N];
void dfs(int x){
    vis[x]=true;
    v[cnt].pb(a[x]);
    for (int i=0;i<(int)G[x].size();i++){
        int u=G[x][i];
        if (!vis[u]) dfs(u);
    }
}
int main(){
    sz=read(n),read(m);
    for (i=1;i<=n;i++){
        read(a[i]);
    }
    for (i=1;i<=m;i++){
        read(x),read(y);
        x++,y++;
        G[x].pb(y);
        G[y].pb(x);
    }
    if (n<2*(n-m-1)) return puts("Impossible"),0;
    for (i=1;i<=n;i++)if(!vis[i]){
        cnt++;
        dfs(i);
        sort(ALL(v[cnt]));
        ans+=v[cnt][0];
        for (j=1;j<(int)v[cnt].size();j++) res.pb(v[cnt][j]);
    }
    if (cnt==1) return puts("0"),0;
    sz=n-m;
    sort(ALL(res));
    for (i=0;i<sz-2;i++) ans+=res[i];
    printf("%lld\n",ans);
    return 0;
}

```', 'public', NULL, 'published', '["Graph Theory","Greedy"]', '2018-02-04T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('blocks', '初探 Github Blocks', '初探 Github Blocks', '## 什么是 Github Blocks

[Github Blocks](https://blocks.githubnext.com/) 是 Github 提供的扩展你的 CodeBase 的方式，他试图改变你在网站上查看 Github 代码的方式。Block 的基本单位有两种，一个是 File，一个是 Folder，当你浏览一个代码文件或者代码文件夹的时候，可以通过切换不同的 Block 去决定如何渲染你的代码。

如图所示，红框框住的位置就是我们切换 Block 的地方，下面一整块是渲染这个 excalidraw 文件的结果。

![images](/images/github-blocks.png)

点击红框框住的地方我们可以看到其他可以渲染这个文件类型的 Block，我们可以点击切换，同时我们可以在搜索栏上搜索 Block，可以搜文字来筛选，也可以直接贴别人 Block 代码仓库的 URL，这其实是为了能够搜索出隐藏的 Block，因为如果一个开发者想要对外暴露 Block，他就必须要在他的仓库上打一个 `github-blocks` 的标签才能被 Github 找到，但我们仍然可以通过贴 URL 的方式找到这个隐藏的 Block。

![images](/images/github-blocks-picker.png)

目前官方已经提供很多 Block 了，比如 Markdown Block，JSON Block，JS Sandbox Block 等等。
## 如何开发 Github Blocks

当社区已有的 Block 不能满足你的需求的时候，你可以自行去开发一个 Block，官方也提供了很好的[模版代码](https://github.com/githubnext/blocks-template)和[开发教程](https://github.com/githubnext/blocks/tree/main/docs/Developing%20blocks)，这里只简单的讲一下。

通过模版代码和开发教程我们可以了解到一个 Block 项目需要在项目根目录存放一个 blocks.config.json 的文件，里面描述了你项目 Block 的信息，比如标题，描述，是 File Block 还是 Folder Block，可以识别的后缀，比如只有 .js 后缀的文件才能使用我的 Block，Block 加载的入口地址等，支持多 Block 的开发。然后你只需要在对应的文件实现一个 React 组件，最后调用官方提供的[脚手架](https://github.com/githubnext/blocks-dev)去打包你的代码即可。Github 会往 React 组件里去注入他暴露的能力，和一些生命周期钩子。

整体开发体验是挺好的，通过脚手架的命令启动以后我们就可以在 Github 页面上去调试我们的 Block 了，通过阅读脚手架的代码，我们可以知道它整体是基于 vite 和 esbuild 来实现本地开发和最终打包的，最终打包出来的代码是以 `var BlockBundle = function() { ... }` 的格式，同时 exclude 掉了 React 相关的库。

```js
// https://github.com/githubnext/blocks-dev/blob/main/scripts/build.js
const esbuild = require("esbuild");
const path = require("path");

process.env.BABEL_ENV = ''production'';
process.env.NODE_ENV = ''production'';

require(''./config/env'');

const build = async () => {
  const blocksConfigPath = path.resolve(process.cwd(), "blocks.config.json");
  const blocksConfig = require(blocksConfigPath);

  const blockBuildFuncs = blocksConfig.map((block) => {
    return esbuild.build({
      entryPoints: [`./` + block.entry],
      bundle: true,
      outdir: `dist/${block.id}`,
      format: "iife",
      globalName: "BlockBundle",
      minify: true,
      external: ["fs", "path", "assert", "react", "react-dom", "@primer/react"],
      loader: {
        ''.ttf'': ''file'',
      },
    });
  });

  try {
    await Promise.all(blockBuildFuncs);
  } catch (e) {
    console.error("Error bundling blocks", e);
  }
}
build()

module.exports = build;
```

## Github Blocks 实现原理介绍

上文提到在开发 Blocks 的过程中，我们只需要对外暴露一个 React 组件，而且最终打包的时候 exclude 掉了 React 相关的库，那么他最终是如何加载的呢？

查看源代码我们可以到整个 Block 的加载就是加载了一个 iframe 标签，iframe src 上的哈希值存储了待加载 Block 的源信息。然后里面会有一段 runtime 的代码，这段代码也已经[开源](https://github.com/githubnext/blocks-runtime)了。

```html
<iframe class="w-full h-full" allow="camera;microphone;xr-spatial-tracking" sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation-by-user-activation allow-popups" src="https://blocks-sandbox.githubnext.com#%7B%22block%22%3A%7B%22type%22%3A%22folder%22%2C%22id%22%3A%22dashboard%22%2C%22title%22%3A%22Dashboard%22%2C%22description%22%3A%22View%20other%20blocks%20in%20a%20dashboard%20view%22%2C%22entry%22%3A%22blocks%2Ffolder-blocks%2Fdashboard%2Findex.tsx%22%2C%22example_path%22%3A%22https%3A%2F%2Fgithub.com%2Fgithubnext%2Fblocks-tutorial%22%2C%22owner%22%3A%22githubnext%22%2C%22repo%22%3A%22blocks-examples%22%7D%2C%22context%22%3A%7B%22repo%22%3A%22blocks%22%2C%22owner%22%3A%22githubnext%22%2C%22path%22%3A%22docs%2FDeveloping%20blocks%22%2C%22sha%22%3A%22main%22%7D%7D"></iframe>
```

通过阅读代码我们可以知道整个 Block 在加载的时候首先会加载这个 runtime 的代码，runtime 做的工作就是和主页面进行通信，当页面加载好的时候会发送 [loaded](https://github.com/githubnext/blocks-runtime/blob/main/src/events.ts#L100) 信息告诉主页面，然后主页面会把相关信息（当前浏览的文件内容，还有加载 Block 的代码）发送过来，这时候 runtime 就来加载我们的 Block，具体加载的方式就是把我们的代码变成一个 script 标签 append 进 DOM 树：

```js
const loadReactContent = (content: string) => {
  return `
var BlockBundle = ({ React, ReactJSXRuntime, ReactDOM, ReactDOMClient, PrimerReact }) => {
  function require(name) {
    switch (name) {
      case "react":
        return React;
      case "react/jsx-runtime":
        return ReactJSXRuntime;
      case "react-dom":
        return ReactDOM;
      case "react-dom/client":
        return ReactDOMClient;
      case "@primer/react":
      case "@primer/components":
        return PrimerReact;
      default:
        console.log("no module ''" + name + "''");
        return null;
    }
  }
${content}
  return BlockBundle;
};`;
};
```

从代码里可以看到打包时候 exclude 掉的库文件通过 runtime 注入的形式补上了，这样可以让业务代码体积尽可能的小，同时 runtime 是复用的，因为当你切换 Block 的时候本质上是切换 url 的 hash，不会触发整个 iframe 的重新加载，iframe 里的页面监听到 hash 发生变化了就会再向主页面去要相关的信息来完成下一次的渲染，因此差值是你的业务代码包的大小。

append 进 DOM 树以后，window 对象上就有 BlockBundle 这个函数了，runtime 这时候去调用执行渲染 Block 的代码就完成首次渲染了。

通过 Runtime 的代码阅读我们也可以知道 Blocks 提供其他技术栈的开发方式，但是全局变量名字要叫 VanillaBlockBundle，官方也提供了 [Vue](https://github.com/githubnext/blocks-template-vue) 和 [Svelte](https://github.com/githubnext/blocks-template-svelte) 的模版代码，从模版代码我们可以看出官方是希望你用 React 的技术栈的，毕竟 Vue 和 Svelte 需要额外打一个对应库的 runtime 进来，性能会有点受损。

## 总结

本文从使用到开发到实现介绍了 Github Blocks，其实 Github 已经提供了代码查看，代码编辑和版本管理，如果能用 Block 去实现在线加载代码并展示，那已经可以实现一个简陋版的 Cloud IDE 了（缺少 Terminal，Extension 等功能），但这个功能本身就已经和市面上的很多产品重叠了（stackblitz，codesandbox），所以看起来实现这个也没有什么意义。整体体验下来功能会比较鸡肋，因为你还要去 blocks.githubnext.com 才能体验，当然这个功能可能是因为没有 public 所以暂时以这种方式见面，然后整体交互会感觉比较重，频繁的切换 Block 性能感觉很差，也没有看到是否能固定一个 Folder Block 展示，这样其实是不能实现我去改其他代码，然后整个项目相关的内容刷新的（或许需要一个 Project Block？），会有一个来回切换加载 Block 的过程，目前想不太到更加有想象力的 Block，只能说期待后面社区的 idea 吧。', 'public', NULL, 'published', '["Misc"]', '2023-02-18T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('bzoj-2131', 'BZOJ 2131 免费的馅饼', 'BZOJ 2131 免费的馅饼', '**题目链接**：[https://darkbzoj.tk/problem/2131](https://darkbzoj.tk/problem/2131)

**题意**：有 $n$ 个从天而降的馅饼，会告诉你每个馅饼掉落的地点时间以及馅饼的价值，刚开始你可以站在任意一个位置，之后你每秒可以向左或向右移动 $1$ 个或 $2$ 个单位，也可以不动，问能获得的最大价值。

**思路**：我们考虑两个馅饼 $i$, $j$，它们都可以用一个三元组表示 $(t_i,pos_i,val_i)$, $(t_j,pos_j,val_j)$，假设 $t_j>t_i$ 根据题意我们可以列出这么一个表达式 

$$
|pos_i-pos_j|\le 2t_j-2t_i
$$

我们拆掉绝对值然后移一下项可以得到以下式子

$$
\begin{matrix}2t_i+pos_i\le 2t_j+pos_j\\2t_i-pos_i\le 2t_j-pos_j\end{matrix}.
$$

所以我们做一下坐标变换，发现这就是经典的带权 $LIS$ 问题，树状数组优化 $DP$ 即可，时间复杂度 $O(nlogn)$。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
struct Node{
	int x,y,v;
	bool operator<(const Node&rhs)const{
		if (x==rhs.x) return y>rhs.y;
		return x<rhs.x;
	}
}coin[N];
int w,n,m,i,p,t,v,ans,dp[N],mx[N];
vector<int>vec;
void compress(){
	sort(vec.begin(),vec.end());
	vec.erase(unique(vec.begin(),vec.end()),vec.end());
	for (i=1;i<=n;++i){
		int pos=lower_bound(vec.begin(),vec.end(),coin[i].y)-vec.begin();
		coin[i].y=pos+1;
	}
	m=(int)vec.size();
}
inline int lowbit(int x){return x&(-x);}
void update(int x,int p){for (;x<=m;x+=lowbit(x)) mx[x]=max(mx[x],p);}
int query(int x){
	int ret=0;
	for (;x>0;x-=lowbit(x)) ret=max(ret,mx[x]);
	return ret;
}
int main(){
	read(w),read(n);
	for (i=1;i<=n;++i){
		read(t),read(p),read(v);
		coin[i].x=2*t+p;
		coin[i].y=2*t-p;
		coin[i].v=v;
		vec.PB(coin[i].y);
	}
	compress();
	sort(coin+1,coin+1+n);
	for (i=1;i<=n;++i){
		dp[i]=query(coin[i].y)+coin[i].v;
		ans=max(ans,dp[i]);
		update(coin[i].y,dp[i]);
	}
	printf("%d\n",ans);
	return 0;
}
```', 'public', NULL, 'published', '["DP","BIT"]', '2019-02-03T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('bzoj-2434', 'BZOJ 2434 [Noi2011]阿狸的打字机', 'BZOJ 2434 [Noi2011]阿狸的打字机', '**题目链接**：[https://darkbzoj.tk/problem/2434](https://darkbzoj.tk/problem/2434)

**题意**：略。

**思路**：首先需要观察到这个打字的过程就是在构造一个 $Trie$ 树，然后考虑询问，可以很容易想到相当于是在 $fail$ 树上询问字符串 $x$ 结尾的那个节点为根的子树里有多少个 $y$ 的节点。但是直接求不好求，所以我们把询问离线，重新走一遍 $Trie$ 的构建过程，用树状数组维护 $dfs$ 序的 $sum$ 值，每走一个节点就单点加一，这样走到一个字符串结尾的时候我们就把这个字符串所有节点都在 $fail$ 树上权值加一了然后就处理这个字符串的所有询问好了，一堆区间查询 $sum$ 值。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
const int N=1e5+10;
const int SIGMA_SIZE=26;
int T,i,j,tot,dfs_clock,n,m,x,y,cnt,ans[N],sum[N],q[N],fail[N],fa[N],pos[N],L[N],R[N],son[N][SIGMA_SIZE];
char s[N];
vector<int>G[N];
vector<pair<int,int> >qu[N];
inline int lowbit(int x){return x&(-x);}
int get(int x){
	int res=0;
	for (;x>0;x-=lowbit(x)) res+=sum[x];
	return res;
}
void add(int x,int v){for(;x<=dfs_clock;x+=lowbit(x))sum[x]+=v;}
void build(char* s){
	int p=0,id=0;
	for (i=0;s[i];++i){
		if (s[i]==''P'') pos[++id]=p;
		else if (s[i]==''B'') p=fa[p];
		else{
			int idx=s[i]-''a'';
			if (!son[p][idx]){
				son[p][idx]=++tot;
				fa[tot]=p;
			}
			p=son[p][idx];
		}
	}
}
void getfail(){
	int head=0,tail=0;
	for (i=0;i<SIGMA_SIZE;++i){
		if (son[0][i]) q[tail++]=son[0][i];
	}
	for (;head!=tail;){
		int u=q[head++];
		for (i=0;i<SIGMA_SIZE;++i){
			if (son[u][i]){
				fail[son[u][i]]=son[fail[u]][i];
				q[tail++]=son[u][i];
			}
			else son[u][i]=son[fail[u]][i];
		}
	}
}
void dfs(int u){
	L[u]=++dfs_clock;
	for (int i=0;i<(int)G[u].size();++i){
		int v=G[u][i];
		dfs(v);
	}
	R[u]=dfs_clock;
}
void solve(){
	int p=0,id=0;	
	add(L[p],1);
	for (i=0;s[i];++i){
		if (s[i]==''P''){
			id++;
			for (j=0;j<(int)qu[id].size();++j){
				int u=qu[id][j].first,idx=qu[id][j].second;
				ans[idx]=get(R[pos[u]])-get(L[pos[u]]-1);
			}
		}
		else if (s[i]==''B''){
			add(L[p],-1);
			p=fa[p];
		}
		else{
			p=son[p][s[i]-''a''];
			add(L[p],1);
		}
	}
}
int main(){
	scanf("%s",s);
	build(s);
	getfail();
	for (i=1;i<=tot;++i) G[fail[i]].PB(i);
	dfs(0);
	for (scanf("%d",&m),i=1;i<=m;++i){
		scanf("%d%d",&x,&y);
		qu[y].PB(MP(x,i));
	}
	solve();
	for (i=1;i<=m;++i) printf("%d\n",ans[i]);
	return 0;
}
```', 'public', NULL, 'published', '["AC Automaton","BIT"]', '2018-09-29T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('bzoj-2905', 'BZOJ 2905 背单词', 'BZOJ 2905 背单词', '**题目链接**：[https://darkbzoj.tk/problem/2905](https://darkbzoj.tk/problem/2905)

**题意**：给定一张包含 $N$ 个单词的表，每个单词有个价值 $W$。要求从中选出一个子序列使得其中的每个单词是后一个单词的子串，最大化子序列中 $W$ 的和。

**思路**：首先对所有单词建立 $AC$ 自动机，$S$ 是 $T$ 的子串等价于 $T$ 的某个前缀通过 $fail$ 链可以走到 $S$ 的终止节点，即 $S$ 的终止节点是 $T$ 某个前缀在 $fail$ 树上的祖先。我们定义 $f[i]$ 为到第 $i$ 个单词为止选了 $i$ 获得的最大价值，则我们有转移方程：

$$
f[i]=max(f[j])+w[i] (j< i)
$$

$j$ 是 $i$ 的子串，假设我们已经求出了 $[1,i-1]$ 的 $f$ 值，它们对后面位置的影响只可能在它们终止节点的子树里，所以我们拿一个线段树维护 $fail$ 树 $dfs$ 序的区间最大值，每次求完 $f[i]$ 以后对它所在的子树区间更新它的 $dp$ 值，求 $f[i]$ 求相当于单点查询字符串 $i$ 每个前缀的节点 $dfs$ 序上的值了，时间复杂度 $O(L\log L)$。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int SIGMA_SIZE=26;
const int N=3e5+10;
const int M=20000+10;
char s[N];
int T,n,i,j,tot,dfs_clock,st[N],ed[N],w[M],fail[N],son[N][SIGMA_SIZE];
ll tag[N<<2];
vector<int>pos[M],G[N];
queue<int>Q;
void ins(char* s,int j){
    int p=1;
    for (int i=0;s[i];++i){
        int idx=s[i]-''a'';
        if (!son[p][idx]) son[p][idx]=++tot;
        p=son[p][idx];
        pos[j].PB(p);
    }
}
void getfail(){
	fail[1]=1;
	for (int i=0;i<SIGMA_SIZE;++i){
		if (!son[1][i]) son[1][i]=1;
		else{
			fail[son[1][i]]=1;
			Q.push(son[1][i]);
		}
	}
    while (!Q.empty()){
        int u=Q.front();Q.pop();
        for (int i=0;i<SIGMA_SIZE;++i){
            if (!son[u][i]) son[u][i]=son[fail[u]][i];
            else{
                fail[son[u][i]]=son[fail[u]][i];
                Q.push(son[u][i]);
            }
        }
    }
}
void dfs(int u){
    st[u]=++dfs_clock;
    for (int i=0;i<(int)G[u].size();++i){
        int v=G[u][i];
        dfs(v);
    }
    ed[u]=dfs_clock;
}
#define lson root<<1,l,mid
#define rson root<<1|1,mid+1,r
inline void up(ll&a,ll b){if(a<b)a=b;}
void build(int root,int l,int r){
    tag[root]=0;
    if (l==r) return;
    int mid=l+((r-l)>>1);
    build(lson);
    build(rson);
}
void query(int root,int l,int r,int pos,ll& dp){
    up(dp,tag[root]);
    if (l==r) return;
    int mid=l+((r-l)>>1);
    if (pos<=mid) query(lson,pos,dp);
    else query(rson,pos,dp);
}
void update(int root,int l,int r,int L,int R,ll val){
    if (L<=l && r<=R){
        up(tag[root],val);
        return;
    }
    int mid=l+((r-l)>>1);
    if (L<=mid) update(lson,L,R,val);
    if (mid<R) update(rson,L,R,val);
}
int main(){
    for (read(T);T--;){
        read(n);
        for (tot=i=1;i<=n;++i){
            scanf("%s%d",s,&w[i]);
            if (w[i]<=0) continue;
            pos[i].clear();
            ins(s,i);
        }
        getfail();
        for (i=2;i<=tot;++i) G[fail[i]].PB(i);
        dfs_clock=0,dfs(1);
        build(1,1,tot);
        ll ans=0;
        for (i=1;i<=n;++i){
            if (w[i]<=0) continue;
            ll dp=0;
            int final=0;
            for (j=0;j<(int)pos[i].size();++j){
                int v=pos[i][j];
                query(1,1,tot,st[v],dp);
                if (j+1==(int)pos[i].size()) final=pos[i][j];
            }
            up(ans,dp+=w[i]);
            update(1,1,tot,st[final],ed[final],dp);
        }
        printf("%lld\n",ans);
        for (i=1;i<=tot;++i){
            G[i].clear();
            for (j=0;j<SIGMA_SIZE;++j) son[i][j]=0;
        }
    }
    return 0;
}
```', 'public', NULL, 'published', '["AC Automaton","DP"]', '2018-09-28T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('bzoj-3172', 'BZOJ 3172 [Tjoi2013]单词', 'BZOJ 3172 [Tjoi2013]单词', '**题目链接**：[https://darkbzoj.tk/problem/3172](https://darkbzoj.tk/problem/3172)

**题意**：求每个单词在所有单词中出现的次数。

**思路**：对所有单词建出 $fail$ 树以后等价于求每个单词结尾节点为根的子树中所有的 $cnt$ 值， $cnt$ 表示这个节点被几个单词在建 $Trie$ 树的时候经过。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=1e6+10;
const int SIGMA_SIZE=26;
char s[N];
int n,i,tot,fail[N],final[N],cnt[N],son[N][SIGMA_SIZE];
queue<int>Q;
vector<int>G[N];
void ins(char* s,int x){
	int p=0;
	for (int i=0;s[i];++i){
		int idx=s[i]-''a'';
		if (!son[p][idx]) son[p][idx]=++tot;
		p=son[p][idx];
		cnt[p]++;
	}
	final[x]=p;
}
void getFail(){
	for (i=0;i<SIGMA_SIZE;++i){
		if (son[0][i]) Q.push(son[0][i]); 
	}
	while (!Q.empty()){
		int u=Q.front();Q.pop();
		for (i=0;i<SIGMA_SIZE;++i){
			if (!son[u][i]) son[u][i]=son[fail[u]][i];
			else{
				fail[son[u][i]]=son[fail[u]][i];
				Q.push(son[u][i]);
			}
		}
	}
}
void dfs(int u){
	for (int i=0;i<(int)G[u].size();++i){
		int v=G[u][i];
		dfs(v);
		cnt[u]+=cnt[v];
	}
}
int main(){
	read(n);
	for (i=1;i<=n;++i){
		scanf("%s",s);
		ins(s,i);
	}
	getFail();
	for (i=1;i<=tot;++i) G[fail[i]].PB(i);
	dfs(0);
	for (i=1;i<=n;++i) printf("%d\n",cnt[final[i]]);
	return 0;
}
```', 'public', NULL, 'published', '["AC Automaton"]', '2018-09-28T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('bzoj-3732', 'BZOJ 3732 Network', 'BZOJ 3732 Network', '**题目链接**：[https://darkbzoj.tk/problem/3732](https://darkbzoj.tk/problem/3732)

**题意**：给定一张图，$q$ 次询问 $a->b$ 的路径上最长边的最小值是多少。

**思路**：建出 $Kruskal$ 重构树以后 $u、v$ 两点的 $lca$ 的点权就是答案。

```cpp
#include<bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&& ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=30000+10;
struct Edge{
	int u,v,w;
	bool operator<(const Edge&rhs)const{
		return w<rhs.w;
	}
};
int n,m,k,u,v,w,tot,i,j,fa[N],sz[N],son[N],f[N],bel[N],dep[N],val[N];
vector<Edge>edge;
vector<int>G[N];
int Find(int x){return x==fa[x]?x:fa[x]=Find(fa[x]);}
void dfs(int u){
	sz[u]=1,son[u]=-1;
	for (int i=0;i<(int)G[u].size();++i){
		int v=G[u][i];
		dep[v]=dep[u]+1,f[v]=u;
		dfs(v);
		sz[u]+=sz[v];
		if (son[u]==-1 || sz[v]>sz[son[u]]) son[u]=v;
	}
}
void dfs2(int u,int f){
	bel[u]=f;
	if (son[u]==-1) return;
	dfs2(son[u],f);
	for (int i=0;i<(int)G[u].size();++i){
		int v=G[u][i];
		if (v==son[u]) continue;
		dfs2(v,v);
	}
}
int lca(int u,int v){
	for (;bel[u]!=bel[v];dep[bel[u]]>dep[bel[v]]?u=f[bel[u]]:v=f[bel[v]]);
	return dep[u]>dep[v]?v:u;
}
int main(){
	read(n),read(m),read(k);
	for (i=1;i<=n;++i) fa[i]=i;
	for (i=1;i<=m;++i){
		read(u),read(v),read(w);
		edge.PB((Edge){u,v,w});
	}
	sort(edge.begin(),edge.end());
	for (tot=n,i=0;i<(int)edge.size();++i){
		int u=edge[i].u,v=edge[i].v,w=edge[i].w;
		int fu=Find(u),fv=Find(v);
		if (fu^fv){
			fa[fu]=fa[fv]=++tot;
			fa[tot]=tot;
			val[tot]=w;
			G[tot].PB(fu),G[tot].PB(fv);
		}
	}
	f[tot]=0,dfs(tot),dfs2(tot,tot);
	for (;k--;){
		read(u),read(v);
		printf("%d\n",val[lca(u,v)]);
	}
	return 0;
}
```', 'public', NULL, 'published', '["Graph"]', '2018-10-16T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('bzoj-3992', 'BZOJ 3992 [SDOI2015]序列统计', 'BZOJ 3992 [SDOI2015]序列统计', '**题目链接**：[https://darkbzoj.tk/problem/3992](https://darkbzoj.tk/problem/3992)

**题意**：略。

**思路**：考虑到 $P$ 是 $NTT$ 中经常使用的模数，我们不妨对式子两边取以 $P$ 的原根 $g$ 为底的对数，得到：

$$
\log_{g}(x_{1}\times x_{2}\times x_{3}\times \cdots \times x_{n}) \equiv \log_{g}(X)(\bmod (P-1))
$$

再得到

$$
\log_{g}(x_{1})+\log_{g}(x_{2})+\cdots+\log_{g}(x_{n}) \equiv \log_{g}(X)(\bmod (P-1))
$$

由此我们就可以把乘法变成了加法就可以构造生成函数来写，即

$$
(a_{0}x^{0}+a_{2}x^{2}+\cdots+a_{m-2}x^{m-2})^{n}\bmod P
$$

这里要用快速幂配合 $NTT$ 来求，最后要输出的就是 $X$ 的离散对数那一项的系数，然后这里还有要注意的是指数加起来 $\bmod (P-1)=ind[X]$ 的值, $ind[X]$ 代表 $X$ 的离散对数，所以我么要把 $i+P-1$ 那一项的系数也加到 $i$ 这一项的系数上来。

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const int maxn=1e5+5;
const int INF=0x3f3f3f3f;
const ll P=(479<<21)+1;
const ll MOD=P;
const ll N=(1<<18);
const double PI=acos(-1.0);
template<typename T> inline T gcd(T&a,T&b){return b==0?a:gcd(b,a%b);}
template<typename T> inline T lcm(T&a,T&b){return a/gcd(a,b)*b;}
template<typename T>
inline T read(T&x){
    x=0;int _f=0;char ch=getchar();
    while(ch<''0''||ch>''9'')_f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
    return x=_f?-x:x;
}
int n,m,x,S;
int ind[maxn];
ll A[maxn],ans[maxn];
ll ksm(ll a,ll n,ll MOD){
    ll res=1;
    while (n){
        if (n&1) res=(res*a)%MOD;
        a=(a*a)%MOD;
        n>>=1;
    }
    return res;
}
ll PrimitiveRoot(ll p){
    if (p==2) return 1;
    for (ll g=2;g<p;g++){
        bool flag=true;
        ll m=sqrt(p+0.5);
        for (ll i=2;i<=m;i++) if ((p-1)%i==0){
            if (ksm(g,(p-1)/i,p)==1){
                flag=false;
                break;
            }
        }
        if (flag) return g;
    }
}
void iniInd(){
    int g=PrimitiveRoot(m),a=1;
    for (int i=0;i<m-1;i++,a=a*g%m) ind[a]=i;
}
struct NumberTheoreticTransfrom{
    int n,rev[maxn];
    ll g,C[maxn];

    void init(int m){
        n=1;
        while (n<m) n<<=1;
        int k=0;
        while ((1<<k)<n) k++;
        for (int i=0;i<n;i++){
            int t=0;
            for (int j=0;j<k;j++) if (i&(1<<j)) t|=(1<<(k-j-1));
            rev[i]=t;
        }
        g=3;
    }

    void NTT(ll* a,int DFT){
        for (int i=0;i<n;i++) if (i<rev[i]) swap(a[i],a[rev[i]]);
        for (int l=2;l<=n;l<<=1){
            int m=l>>1;
            ll wn=ksm(g,DFT==1?(P-1)/l:P-1-(P-1)/l,P);
            for (int k=0;k<n;k+=l){
                ll w=1LL;
                for (int j=0;j<m;j++){
                    ll u=w*a[k+j+m];
                    ll t=a[k+j];
                    a[k+j]=(t+u)%P;
                    a[k+j+m]=((t-u)%P+P)%P;
                    w=w*wn%P;
                }
            }
        }
        if (DFT==-1){
            ll inv=ksm(n,P-2,P);
            for (int i=0;i<n;i++) a[i]=a[i]*inv%P;
        }
        return;
    }

    void SQR(ll *A){
        NTT(A,1);
        for (int i=0;i<n;i++) A[i]=A[i]*A[i]%MOD;
        NTT(A,-1);
        for (int i=0;i<m-1;i++){
            A[i]=(A[i]+A[i+m-1])%MOD;
            A[i+m-1]=0;
        }
    }

    void mul(ll *A,ll* B){
        for (int i=0;i<n;i++) C[i]=B[i];
        NTT(A,1),NTT(C,1);
        for (int i=0;i<n;i++) A[i]=A[i]*C[i]%MOD;
        NTT(A,-1);
        for (int i=0;i<m-1;i++){
            A[i]=(A[i]+A[i+m-1])%MOD;
            A[i+m-1]=0;
        }
    }

    void powPoly(ll *A,int n,ll *ans){
        ans[0]=1;
        while (n){
            if (n&1) mul(ans,A);
            SQR(A);
            n>>=1;
        }
    }
}ntt;
int main(){
    read(n),read(m),read(x),read(S);
    ntt.init(m+m);
    iniInd();
    for (int i=1;i<=S;i++){
        int x;read(x);
        if (x) A[ind[x]]=1;
    }
    ntt.powPoly(A,n,ans);
    printf("%lld\n",ans[ind[x]]);
    return 0;
}
```', 'public', NULL, 'published', '["NTT","Math"]', '2017-08-14T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('bzoj-4513', 'BZOJ 4513 [SDOI2016]储能表', 'BZOJ 4513 [SDOI2016]储能表', '**题目链接**：[http://www.lydsy.com/JudgeOnline/problem.php?id=4513](http://www.lydsy.com/JudgeOnline/problem.php?id=4513)

**题意**：略。

**思路**：异或考虑二进制分解，可以考虑统计 $i\ xor\ j>k$ 的个数和异或和，我们就可以直接计算出答案，从高位到低位考虑进行数位 $DP$，设 $f[x][a][b][c]$, $g[x][a][b][c]$ 为考虑前 $x$ 位，$i<n$, $j<m$, $i$, $j$ 大于 $k$ 的方案数和异或和，然后去转移就可以了，最后的答案就是 $g[0][0][0][0]-kf[0][0][0][0]$。

```cpp
#include <cstdio>
#include <cstring>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
int T,i,a,b,c,x,y,p,f[62][2][2][2],g[62][2][2][2];
ll n,m,k,table[62];
void up(int&a,int b){a+=b;if(a>=p)a-=p;}
int main(){
	for (read(T);T--;){
		memset(f,0,sizeof(f));
		memset(g,0,sizeof(g));
		read(n),read(m),read(k),read(p);
		for (table[0]=i=1;i<62;i++) table[i]=(table[i-1]<<1)%p;
		f[61][1][1][1]=1;
		for (i=60;i>=0;i--) for (a=0;a<2;a++) for (b=0;b<2;b++) for (c=0;c<2;c++) if (f[i+1][a][b][c]){
			int pn=(n>>i)&1,pm=(m>>i)&1,pk=(k>>i)&1;
			for (x=0;x<=(a?pn:1);x++) for (y=0;y<=(b?pm:1);y++){
				int d=x^y;
				if (c && d<pk) continue;
				up(f[i][a && x==pn][b && y==pm][c && d==pk],f[i+1][a][b][c]);
				up(g[i][a && x==pn][b && y==pm][c && d==pk],g[i+1][a][b][c]);
				if (d) up(g[i][a && x==pn][b && y==pm][c && d==pk],table[i]*f[i+1][a][b][c]%p);
			}
		}
		int res=0;k%=p;
		up(res,((g[0][0][0][0]-k*f[0][0][0][0]%p)%p+p)%p);
		printf("%d\n",res);
	}
	return 0;
}
```', 'public', NULL, 'published', '["DP"]', '2018-03-24T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('bzoj-4529', 'BZOJ 4259 残缺的字符串', 'BZOJ 4259 残缺的字符串', '**题目链接**:[http://codeforces.com/problemset/problem/997/C](http://codeforces.com/problemset/problem/997/C)

**题意**：给你一个 $n\times n$ 的空白矩阵，你要往里面染色，可以染的颜色只有三种，符合条件的染色方案是至少出现一行或一列的颜色都是一样的，问合法的方案一共有几种。

**思路**：我们定义 $f[i]$ 为 $A$ 串位置 $i$ 是否为通配符，如果是就是 $0$，不是就是 $1$，同理 $g[i]$ 为 $B$ 串位置 $i$ 是否为通配符，对于从 $B$ 串位置 $j$ 开始的字符串，我们定义一个函数 $p[j]=\sum_{i=0}^{m-1}(A[i]-B[i+j])^2 f[i]g[i+j]$，则显然可以知道 $p[j]$ 为 $0$ 的时候 $A$ 串与 $B$ 串从 $j$ 位置开始长度为 $m$ 的子串匹配，所以我们只要知道 $p[j]$ 的所有值就可以知道所有匹配的位置，然后我们把那个式子展开发现每一段都是一个类似于卷积的形式，所以稍微作一下变换化成卷积形式上 $FFT$ 就可以了，时间复杂度 $O(n\log n)$。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=6e5+10;
const double PI=acos(-1.0);
struct cd{
    double x,y;
    cd(double a=0,double b=0):x(a),y(b){}
}A[N],B[N],C[N];
inline cd operator +(cd a,cd b){return cd(a.x+b.x,a.y+b.y);}
inline cd operator -(cd a,cd b){return cd(a.x-b.x,a.y-b.y);}
inline cd operator *(cd a,cd b){return cd(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
inline cd conj(cd a){return cd(a.x,-a.y);}
cd w[2][N];
void init(int n){
    for (int k=0;k<n;k++){
        w[0][k]=cd(cos(2*PI/n*k),sin(2*PI/n*k));
        w[1][k]=conj(w[0][k]);
    }
}
void fft(cd *a,int n,int v){
    for (int i=0,j=0;i<n;i++){
        if(i<j) swap(a[i],a[j]);
        for (int l=n>>1;(j^=l)<l;l>>=1);
    }
    for (int l=2;l<=n;l<<=1){
        int m=l>>1;
        for (int i=0;i<n;i+=l){ 
            for (int k=0;k<m;k++){
                cd t=w[v][n/l*k]*a[i+k+m];
                a[i+k+m]=a[i+k]-t;
                a[i+k]=a[i+k]+t;
            }
        }
    }
    if (!v) return;
    for (int i=0;i<n;i++) a[i].x/=n;
}
int n,m,i,j,len,cnt,res[N];
char a[N],b[N];
int main(){
    read(m),read(n);
    scanf("%s%s",a,b);
    for (i=0,j=m-1;i<j;i++,j--) swap(a[i],a[j]);
    for (len=1;len<n+m;len<<=1);
    init(len);
    //part1
    for (i=0;i<len;i++){
        A[i].x=i<m?(a[i]-''a''+1)*(a[i]-''a''+1)*(a[i]!=''*''):0;
        A[i].y=0;
    }
    for (i=0;i<len;i++){
        B[i].x=i<n?(b[i]!=''*''):0;
        B[i].y=0;
    }
    fft(A,len,0),fft(B,len,0);
    for (i=0;i<len;i++) C[i]=C[i]+A[i]*B[i];
    //part2
    for (i=0;i<len;i++){
        A[i].x=i<m?(a[i]-''a''+1)*(a[i]!=''*''):0;
        A[i].y=0;
    }
    for (i=0;i<len;i++){
        B[i].x=i<n?(b[i]-''a''+1)*(b[i]!=''*''):0;
        B[i].y=0;
    }
    fft(A,len,0),fft(B,len,0);
    for (i=0;i<len;i++) C[i]=C[i]-cd(2.0,0)*A[i]*B[i];
    //part3
    for (i=0;i<len;i++){
        A[i].x=i<m?(a[i]!=''*''):0;
        A[i].y=0;
    }
    for (i=0;i<len;i++){
        B[i].x=i<n?(b[i]-''a''+1)*(b[i]-''a''+1)*(b[i]!=''*''):0;
        B[i].y=0;
    }
    fft(A,len,0),fft(B,len,0);
    for (i=0;i<len;i++) C[i]=C[i]+A[i]*B[i];

    fft(C,len,1);

    for (i=m-1;i<n;i++) if(fabs(C[i].x)<0.5) res[++cnt]=i-m+1;
    printf("%d\n",cnt);
    for (i=1;i<=cnt;i++) printf("%d%c",res[i]+1,i==cnt?''\n'':'' '');
    return 0;
}
```', 'public', NULL, 'published', '["FFT"]', '2018-08-20T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codechef-KLPM', 'CodeChef April Challenge 2019 Kira Loves Palindromes', 'CodeChef April Challenge 2019 Kira Loves Palindromes', '**题目链接**：[https://www.codechef.com/problems/KLPM](https://www.codechef.com/problems/KLPM)

**题意**：给一个字符串，求截出两段非空非交字符串按顺序拼起来后是回文串的方案数。

**思路**：预处理出 $L[i][j]$ 表示 $[i,j]$ 区间以 $i$ 开头的回文串有多少个，$R[i][j]$ 表示 $[i,j]$ 区间以 $j$ 结尾的回文串有多少个。然后枚举两个端点 $p,q$ 往两侧二分最长相等长度，记这个长度为 $len$，则对答案的贡献就是 $len\times (L[i+1][j-2]+R[i+2][j-1]+1)$，加一是表示其中为空串的情况，相当于我们把一个有效的回文串拆成了三段，先找到两边相等的串然后再去统计中间也是回文串的个数，注意这要是与其中某个串拼起来的，这样就可以统计了，时间复杂度 $O(n^2logn)$，判断是否相等用哈希判就好了。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
typedef unsigned long long ull;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const ull base=233;
const int N=1000+10;
int i,j,len,l,r,L[N][N],R[N][N];
ll ans;
ull f[2][N],Po[N];
char s[N];
ull getHash(int l,int r){return f[0][r]-f[0][l-1]*Po[r-l+1];}
ull getHash2(int l,int r){return f[1][l]-f[1][r+1]*Po[r-l+1];}
void get(int a,int b){
	int l=1,r=min(a,len-b+1),res=-1;
	while (l<=r){
		int mid=l+((r-l)>>1);
		if (getHash(a-mid+1,a)==getHash2(b,b+mid-1)){
			res=mid;
			l=mid+1;
		}
		else r=mid-1;
	}
	if (~res){
		if (a+1==b-1) ans+=res;
		else ans+=1LL*res*(L[a+1][b-2]+R[a+2][b-1]+1);
	}
}
inline bool isPa(int l,int r){return getHash(l,r)==getHash2(l,r);}
int main(){
	scanf("%s",s+1);len=strlen(s+1);
	for (i=1;i<=len;++i) f[0][i]=f[0][i-1]*base+s[i];
	for (i=len;i>=1;--i) f[1][i]=f[1][i+1]*base+s[i];
	for (Po[0]=i=1;i<=len;++i) Po[i]=Po[i-1]*base;
	for (i=1;i<=len;++i){
		for (j=i;j<=len;++j){
			if (isPa(i,j)){
				L[i][j]++;
				R[i][j]++;
				ans+=j-i;
			}
		}
	}
	for (i=1;i<=len;++i){
		for (j=i+1;j<=len;++j){
			L[i][j]+=L[i][j-1];//[i,j]以i开头是回文串的个数
		}
	}
	for (j=1;j<=len;++j){
		for (i=j-1;i>=1;--i){
			R[i][j]+=R[i+1][j];//[i,j]以j结尾是回文串的个数
		}
	}
	for (i=1;i<=len;++i){
		for (j=i+2;j<=len;++j){
			get(i,j);
		}
	}
	printf("%lld\n",ans);
	return 0;
}
```', 'public', NULL, 'published', '["String","Binary Search"]', '2019-04-17T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codechef-danyanum', 'CodeChef Danya and Numbers', 'CodeChef Danya and Numbers', '**题目链接**：[https://www.codechef.com/problems/DANYANUM](https://www.codechef.com/problems/DANYANUM)

**题意**：[http://www.codechef.com/download/translated/COOK95/mandarin/DANYANUM.pdf](http://www.codechef.com/download/translated/COOK95/mandarin/DANYANUM.pdf)

**思路**：首先考虑没有删除插入，单单看询问 $3$，我们要怎么快速求？考虑对于一个答案，我们在集合中拿出来的数相与是这个数，说明我们拿出来的数都是这个答案的超集，所以直接高维前缀和预处理后即可 $O(1)$ 查询，只要这个答案的超集大于等于 $x$ 我们就可以找到这么一个方案。然后考虑如何确定最大的答案，直接按位从高到低贪心即可，这一位能选就选，最后的答案一定是最优的。接下来考虑带删除插入，如果每次插入删除就求一次高维前缀和肯定是不行的，所以我们需要稍微牺牲查询的时间，或者说尽量平衡查询和插入删除的时间，所以考虑对询问分块，每 $\sqrt n$ 次修改操作以后我们就重新求一遍高维前缀和，否则就拿一个队列存下当前修改的数以及是删除还是插入，用正负一来代表，这样询问的时候块内元素暴力遍历一遍即可，这样就平衡了复杂度，时间复杂度 $O(\sqrt m * k * 2^k+m* \sqrt m * k)$。

```cpp
#include <bits/stdc++.h>
using namespace std;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=(1<<18)+10;
int n,m,k,i,sz,qsize,op,x,cnt[N],num[N],q[N],qval[N];
void SOS(){
	int i,status;
	for (i=0;i<(1<<k);++i) num[i]=cnt[i];
	for (i=0;i<k;++i){
		for (status=0;status<(1<<k);++status){
			if (!(status&(1<<i))) num[status]+=num[status|(1<<i)];
		}
	}
}
void add(int x){
	if (qsize>=sz){
		qsize=0;
		SOS();
	}
	cnt[x]++;
	q[qsize]=x;
	qval[qsize]=1;
	qsize++;
}
void del(int x){
	if (qsize>=sz){
		qsize=0;
		SOS();
	}
	cnt[x]--;
	q[qsize]=x;
	qval[qsize]=-1;
	qsize++;
}
int getNum(int status){
	int res=num[status],i;
	for (i=0;i<qsize;++i){
		if ((q[i]&status)==status) res+=qval[i];
	}
	return res;
}
int solve(int x){
	int res=0,i;
	for (i=18;i>=0;--i){
		if (getNum(res|(1<<i))>=x) res|=1<<i;
	}
	return res;
}
int main(){
	read(n),read(m),read(k);
	for (i=1;i<=n;++i){
		read(x);
		cnt[x]++;
	}
	SOS();
	sz=sqrt(m+0.5);
	for (;m--;){
		read(op),read(x);
		if (op==1) add(x);
		if (op==2) del(x);
		if (op==3) printf("%d\n",solve(x));
	}
	return 0;
}
```', 'public', NULL, 'published', '["Greedy","DP","Square Technique"]', '2018-09-14T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codechef-monster', 'CodeChef Killing Monsters', 'CodeChef Killing Monsters', '**题目链接**：[https://www.codechef.com/problems/MONSTER](https://www.codechef.com/problems/MONSTER)

**题意**：[http://www.codechef.com/download/translated/JAN18/mandarin/MONSTER.pdf](http://www.codechef.com/download/translated/JAN18/mandarin/MONSTER.pdf)

**思路**：每次暴力算不可取，考虑将攻击一块块考虑，对于每一块我们计算出对每个怪兽的总的攻击量，这个直接高维前缀和即可求得，然后再遍历每个怪兽，如果这个怪兽还存活而且被击杀，我们就暴力遍历这个块找到是什么时候被击杀的，因为暴力遍历只会有 $n$ 次，每次遍历 $\sqrt n$ 的长度，所以时间复杂度是 $O(n\sqrt n)$ 的，而外部是一块块统计，每次遍历，所以时间复杂度大概是 $O(n\sqrt n \log n)$。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=3e5+10;
struct Query{int x,y;}q[N];
ll h[N],f[N];
int n,i,j,k,mask,len,Q,sz,res[N],block[N];
void cal(int idx){
	int L=(idx-1)*sz+1,R=min(idx*sz,Q);
	for (int i=0;i<=mask;++i) f[i]=0;
	for (int i=L;i<=R;++i) f[q[i].x]+=q[i].y; 
	for (int i=0;i<len;++i){
		for (int status=0;status<(1<<len);++status){
			if (!(status&(1<<i))) f[status]+=f[status|(1<<i)];
		}
	}
}
int main(){
	read(n);
	for(mask=1;mask<n;mask<<=1)len++;mask--; 
	for (i=0;i<n;++i) read(h[i]);
	read(Q),sz=sqrt(Q+0.5);
	for (i=1;i<=Q;++i){
		read(q[i].x),read(q[i].y);
		q[i].x&=mask;
		block[i]=(i-1)/sz+1;
	}
	for (i=1;i<=(Q-1)/sz+1;++i){
		cal(i);
		for (j=0;j<n;++j)if(h[j]>0){
			h[j]-=f[j];
			if (h[j]<=0){
				h[j]+=f[j];
				for (k=(i-1)*sz+1;k<=min(i*sz,Q);++k){
					if ((j&q[k].x)==j){//careful
						h[j]-=q[k].y;
						if (h[j]<=0){
							res[k]++;
							break;
						}
					}
				}
			}
		}
	}
	for (i=1;i<=Q;++i){
		res[i]+=res[i-1];
		printf("%d\n",n-res[i]);
	}
	return 0;
}
```', 'public', NULL, 'published', '["Sqrt Algorithm","DP"]', '2018-09-14T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-1030F', 'Codeforces 1030F Putting Boxes Together', 'Codeforces 1030F Putting Boxes Together', '**题目链接**：[http://codeforces.com/problemset/problem/1030/F](http://codeforces.com/problemset/problem/1030/F)

**题意**：有 $n$ 个物品，告诉你每个物品的位置 $a_i$ 和质量 $w_i$，它每次移动到旁边相邻的没有被占的位置消耗的能量为 $w_i$，现在有 $q$ 次操作，操作 $1$：单点修改下标 $i$ 的质量 $w_i$,操作 $2$:区间询问 $[l,r]$,将下标 $[L,R]$ 的物品移到连续的一段位置上所消耗的最少的能量是多少，即全部移动到 $[x,x+(R-L)]$。

**思路**：对于操作 $2$，我们要做的就是求 $min(\sum_{i=L}^{R}w_i\left |a_i-(x+i-L+1)\right |)$，稍微变一下得到:

$$
min(\sum_{i=L}^{R}w_i\left |(a_i-i)-(x-L+1)|\right )
$$

问题就转化成了带权中位数的问题，我们拿树状数组维护 $w_i(a_i-i)$ 和 $w_i$ 的的和，查询的时候用求带权中位数的方法去二分然后算贡献即可，时间复杂度 $O(n+q\log^2n)$,据说树状数组查询可以优化到 $\log n$，不过我还不会，只会拿可持久化线段树把查询复杂度优化到 $\log n$。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=2e5+10;
const int P=1e9+7;
int n,q,i,x,y,a[N],w[N],pres[N],sum2[N];
ll sum[N],prew[N];
inline void up(int&a,int b){a+=b;if(a>=P)a-=P;}
inline int lowbit(int x){return x&(-x);}
void add1(int x,int val){for(;x<=n;x+=lowbit(x))sum[x]+=val;}
void add2(int x,int val){for(;x<=n;x+=lowbit(x))up(sum2[x],val);}
ll get1(int x){
	ll res=0;
	for (;x>0;x-=lowbit(x)) res+=sum[x];
	return res;
}
int get2(int x){
	int res=0;
	for (;x>0;x-=lowbit(x)) up(res,sum2[x]);
	return res;
}
void revise(int pos,int nw){
	add1(pos,-w[pos]);
	add2(pos,(-1LL*w[pos]*a[pos]%P+P)%P);
	w[pos]=nw;
	add1(pos,w[pos]);
	add2(pos,(1LL*w[pos]*a[pos]%P+P)%P);
}
void work(int L,int R){
	ll t=get1(L-1);
	ll tot=get1(R)-get1(L-1);
	int l=L,r=R,pos=R;
	while (l<=r){
		int mid=l+((r-l)>>1);
		ll v=get1(mid)-t;
		if (v*2LL>=tot){
			r=mid-1;
			pos=mid;
		}
		else l=mid+1;
	}
	ll A=get2(pos)-get2(L-1);
	ll B=get2(R)-get2(pos);
	ll C=-1LL*a[pos]*((get1(pos)-t)%P)%P;
	ll D=-1LL*a[pos]*((get1(R)-get1(pos))%P)%P;
	ll res=(B+D-A-C)%P;
	if (res<0) res+=P;
	printf("%lld\n",res);
}
int main(){
	read(n),read(q);
	for (i=1;i<=n;++i){
		read(a[i]);
		a[i]-=i;
	}
	for (i=1;i<=n;++i){
		read(w[i]);
		prew[i]=prew[i-1]+w[i];
		sum[i]=prew[i]-prew[i-lowbit(i)];
	
		pres[i]=(pres[i-1]+1LL*a[i]*w[i]%P)%P;
		if (pres[i]<0) pres[i]+=P;
		sum2[i]=pres[i]-pres[i-lowbit(i)];
		if (sum2[i]<0) sum2[i]+=P;
	}
	for (;q--;){
		read(x),read(y);
		if (x<0) revise(-x,y);
		else work(x,y);
	}
	return 0;
}
```', 'public', NULL, 'published', '["Segment Tree"]', '2018-09-26T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-1100F', 'Codeforces 1100F Ivan and Burgers', 'Codeforces 1100F Ivan and Burgers', '**题目链接**：[https://codeforces.com/problemset/problem/1100/F](https://codeforces.com/problemset/problem/1100/F)

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
	while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
	while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
```', 'public', NULL, 'published', '["Greedy","Data Structure","Divide and Conquer"]', '2019-01-18T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-1107E', 'Codeforces 1107E Vasya and Binary String', 'Codeforces 1107E Vasya and Binary String', '**题目链接**：[https://codeforces.com/problemset/problem/1107/E](https://codeforces.com/problemset/problem/1107/E)

**题意**：有一个 $01$ 字符串，告诉你消去连续一段相同字符的长度为 $x$ 价值 $val[x]$，求消掉这个字符串的最大价值。

**思路**：区间 $dp$，我们定义 $dp[l][r][k]$ 表示区间 $[l,r]$ 后面有 $k$ 个与 $s[r]$ 相同的字符下消去 $[l,r]$ 的最大价值，转移分两种，一种是这个 $k$ 个最后一个一起消掉了，那么

$$
dp[l][r][k]=max(dp[l][r]][k],dp[l][r-1][0]+val[k+1])
$$

否则我们让最后一个字符再跟 $[l,r-1]$ 的相同的字符一起连起来消掉，假设我们枚举的位置是 $i$，那么转移方程为

$$
dp[l][r][k]=max(dp[l][r][k],dp[l][i][k+1]+dp[i+1][r-1][0])
$$

时间复杂度 $O(n^4)$

```cpp
#include<bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&& ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=100+10;
int n,i,a[N];
char s[N];
ll dp[N][N][N];
ll cal(int l,int r,int k){
	if (l>r) return 0;
	if (l==r) return a[k+1];
	if (~dp[l][r][k]) return dp[l][r][k];
	dp[l][r][k]=cal(l,r-1,0)+a[k+1];
	for (int i=l;i<r;++i){
		if (s[i]==s[r]){
			dp[l][r][k]=max(dp[l][r][k],cal(l,i,k+1)+cal(i+1,r-1,0));
		}
	}
	return dp[l][r][k];
}
int main(){
	memset(dp,-1,sizeof(dp));
	read(n);
	scanf("%s",s+1);
	for (i=1;i<=n;++i) read(a[i]);
	printf("%lld\n",cal(1,n,0));
	return 0;
}
```', 'public', NULL, 'published', '["DP"]', '2019-01-30T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-1107F', 'Codeforces 1107F Vasya and Endless Credits', 'Codeforces 1107F Vasya and Endless Credits', '**题目链接**：[https://codeforces.com/problemset/problem/1107/F](https://codeforces.com/problemset/problem/1107/F)

**题意**：有 $n$ 种贷款，每一个月你最多可以选择一个贷款并得到 $a$ 元的收益，但在月底的时候你需要支付 $b$ 元并连续支付 $k$ 个月，你可以在月中的时候买一辆车，问这辆车最大的价值可以是多少。

**思路**：我们定义 $f(i,j)=max(0,a_i-b_i*min(k_i,j-1))$ 表示第 $i$ 个贷款在买车的倒数第 $j$ 个月买入对答案贡献的价值，我们可以注意到每个月只会有一个贷款买入而且到我们要买车的那个月的时候每个贷款经历的月份是不一样的，所以我们可以建立一个二分图，左边代表基金，右边代表月份，连边的代价就是 $f(i,j)$ 然后去跑二分图带权最大匹配即可，时间复杂度 $O(n^3)$。

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=500+10;
const ll INF=2e18;
int i,j,x,n,match[N],pre[N];
ll a[N],b[N],k[N],cost[N][N],lx[N],ly[N],slack[N];
bool vy[N];
void augment(int root){
    fill(vy+1,vy+n+1,false);
    fill(slack+1,slack+n+1,INF);
    int py;
    match[py=0]=root;
    do{
        vy[py]=true;
        int x=match[py],yy;
        ll delta=INF;
        for (int y=1;y<=n;y++){
            if (!vy[y]){
                if (lx[x]+ly[y]-cost[x][y]<slack[y]){
                    slack[y]=lx[x]+ly[y]-cost[x][y];
                    pre[y]=py;
                }
                if (slack[y]<delta){
                    delta=slack[y];
                    yy=y;
                }
            }
        }
        for (int y=0;y<=n;y++){
            if (vy[y]){
                lx[match[y]]-=delta;
                ly[y]+=delta;
            }
            else{
                slack[y]-=delta;
            }
        }
        py=yy;
    }while(~match[py]);
    do{
        int cnt=pre[py];
        match[py]=match[cnt];
        py=cnt;
    }while(py);
}
ll KM(){
    for (int i=1;i<=n;i++){
        lx[i]=ly[i]=0;
        match[i]=-1;
        for (int j=1;j<=n;j++) lx[i]=max(lx[i],cost[i][j]);
    }
    ll ans=0;
    for (int i=1;i<=n;i++) augment(i);
    for (int i=1;i<=n;i++){
        ans+=lx[i];
        ans+=ly[i];
    }
    return ans;
}
int main(){
    read(n);
    for (i=1;i<=n;i++){
    	read(a[i]),read(b[i]),read(k[i]);
        for (j=1;j<=n;j++){
            cost[i][j]=max(a[i]-b[i]*min(k[i],j-1LL),0LL);
        }
    }
    printf("%lld\n",KM());
    return 0;
}
```', 'public', NULL, 'published', '["Graph Theory"]', '2019-01-31T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-1107G', 'Codeforces 1107G Vasya and Maximum Profit', 'Codeforces 1107G Vasya and Maximum Profit', '**题目链接**：[https://codeforces.com/problemset/problem/1107/G](https://codeforces.com/problemset/problem/1107/G)

**题意**：有 $n$ 个问题，第 $i$ 个问题难度系数为 $d_i$ 且难度递增，如果你选择了第 $i$ 个问题，你需要支付作者 $c_i$ 元，自己获得 $a$ 元的收益，假如你选了一个区间 $[l,r]$ 且 $r-l+1>=2$，你还需要额外支付 $max(d_i-d_{i-1})*(d_i-d_{i-1})$ 元，问你能获得的最大的收益是多少。

**思路**：我们可以枚举每一对 $d_i-d_{i-1}$，去计算它们作为最大值的时候左右延伸到的区间，然后问题就转化成了求跨过 $[i-1,i]$ 的最大子段和，我们可以用线段树维护一个前缀最大和和后缀最大和，查询的时候就查询以 $i-1$ 为末尾的后缀最大和以及以 $i$ 为开头的前缀最大和拼一下去更新答案即可，时间复杂度 $O(nlogn)$。

```cpp
#include<bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&& ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=3e5+10;
struct Node{
	ll sum,pre,suff;
}p[N<<2];
int n,i,l[N],r[N];
ll ans,a,td[N],d[N],c[N];
#define lson root<<1,l,mid
#define rson root<<1|1,mid+1,r
void pushup(int root){
	p[root].sum=p[root<<1].sum+p[root<<1|1].sum;
	p[root].pre=max(p[root<<1].pre,p[root<<1].sum+p[root<<1|1].pre);
	p[root].suff=max(p[root<<1|1].suff,p[root<<1].suff+p[root<<1|1].sum);
}
void build(int root,int l,int r){
	if (l==r){
		p[root].sum=p[root].pre=p[root].suff=c[l];
		return;
	}
	int mid=l+((r-l)>>1);
	build(lson);
	build(rson);
	pushup(root);
}
pair<ll,ll> MergePre(const pair<ll,ll>&A,const pair<ll,ll>&B){
	pair<ll,ll> res=A;
	res.first+=B.first;
	res.second=max(res.second,A.first+B.second);
	return res;
}
pair<ll,ll> queryPre(int root,int l,int r,int L,int R){
	if (L<=l && r<=R) return MP(p[root].sum,p[root].pre);
	int mid=l+((r-l)>>1);
	if (L>mid) return queryPre(rson,L,R);
	else if (R<=mid) return queryPre(lson,L,R);
	else return MergePre(queryPre(lson,L,R),queryPre(rson,L,R)); 
}
pair<ll,ll> MergeSuff(const pair<ll,ll>&A,const pair<ll,ll>&B){
	pair<ll,ll> res=B;
	res.first+=A.first;
	res.second=max(res.second,A.second+B.first);
	return res;
}
pair<ll,ll> querySuff(int root,int l,int r,int L,int R){
	if (L<=l && r<=R) return MP(p[root].sum,p[root].suff);
	int mid=l+((r-l)>>1);
	if (L>mid) return querySuff(rson,L,R);
	else if (R<=mid) return querySuff(lson,L,R);
	else return MergeSuff(querySuff(lson,L,R),querySuff(rson,L,R)); 
}
int main(){
	read(n),read(a);
	for (i=1;i<=n;++i){
		read(d[i]),read(c[i]);
		td[i]=d[i]-d[i-1];
		c[i]=a-c[i];
		l[i]=r[i]=i;
		ans=max(ans,c[i]);
	}
	build(1,1,n);
	for (i=2;i<=n;++i){
		int cur=i;
		while (cur>1 && td[i]>=td[cur-1]) cur=l[cur-1];
		l[i]=cur;
	}
	for (i=n-1;i>=1;--i){
		int cur=i;
		while (cur<n && td[i]>=td[cur+1]) cur=r[cur+1];
		r[i]=cur;
	}
	for (i=2;i<=n;++i){
		ans=max(ans,querySuff(1,1,n,max(l[i]-1,1),i-1).second+queryPre(1,1,n,i,r[i]).second-1LL*td[i]*td[i]);
	}
	printf("%lld\n",ans);
	return 0;
}
```', 'public', NULL, 'published', '["Segment Tree"]', '2018-01-30T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-1111E', 'Codeforces 1111E Tree', 'Codeforces 1111E Tree', '**题目链接**：[https://codeforces.com/problemset/problem/1111/E](https://codeforces.com/problemset/problem/1111/E)

**题意**：给定一棵树，若干询问，每次询问 $k$ 个点把这 $k$ 个点划分成不超过 $m$ 个集合的方案数，要求集合里起码有一个点，且在以 $r$ 为根的树下，每个点都不能与它的祖先所在的集合相同。

**思路**：对 $k$ 个点还有根节点 $r$ 一起建出虚树以后 $dp$，$dfs$ 序进行的树形 $dp$，维护答案数组 $dp[x]$ 表示划分成 $x$ 个集合的方案数，那么 $dfs$ 到这个点的时候我们已经处理出了这个点以前的所有点的答案数组，对于 $x$ 我们的转移就分两种，一种是自己新开一个集合那么从 $dp[x-1]$ 转移过来，要么就加入到之前的集合里，但如果 $x$ 小于它的祖先个数那么 $dp$ 就为 $0$，没办法再加入了，否则就是 $dp[x]*(x-num)$，代表加入到别的没有祖先节点的集合里，这样就可以了，最后答案就是 $\sum_{i=1}^{m}dp[i]$。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
const int P=1e9+7;
const int INF=2000000000;
int n,i,u,v,q,k,m,r,top,dfs_clock,dfn[N],points[N],bel[N],fa[N],son[N],sz[N],dep[N],dp[N];
bool isVirtual[N];
vector<int>G[N],G2[N];
void dfs(int u,int f){
    fa[u]=f,dep[u]=dep[f]+1,sz[u]=1,son[u]=-1,dfn[u]=++dfs_clock;
    for (auto &v:G[u]){
        if (v==f) continue;
        dfs(v,u);
        sz[u]+=sz[v];
        if (son[u]==-1 || sz[v]>sz[son[u]]) son[u]=v;
    }
}
void dfs2(int u,int f){
    bel[u]=f;
    if (son[u]==-1) return;
    dfs2(son[u],f);
    for (auto &v:G[u]){
        if (v==fa[u] || v==son[u]) continue;
        dfs2(v,v);
    }
}
int lca(int u,int v){
    for (;bel[u]!=bel[v];dep[bel[u]]>dep[bel[v]]?u=fa[bel[u]]:v=fa[bel[v]]);
    return dep[u]>dep[v]?v:u;
}
void addEdge(int u,int v){
    G2[u].PB(v);
    G2[v].PB(u);
}
inline void up(int&a,int b){a+=b==P?0:b;if(a>=P)a-=P;}
void DP(int u,int f,int dep){
    if (isVirtual[u]){
        for (int i=m;i>=1;--i){
            if (i>dep) dp[i]=1LL*dp[i]*(i-dep)%P;
            else dp[i]=0;
            up(dp[i],dp[i-1]);
        }
        dp[0]=0;
    }
    for (auto &v:G2[u]){
        if (v==f) continue;
        DP(v,u,dep+isVirtual[u]);
    }
    G2[u].clear();
}
inline bool cmp(const int&a,const int&b){return dfn[a]<dfn[b];}
void build(int points[],int k){
    static int stk[N];
    sort(points,points+k,cmp);

    top=0,stk[top++]=0;
    int cnt=k;
    for (int i=0;i<k;i++){
        int u=points[i],f=lca(u,stk[top-1]);
        if (f==stk[top-1]) stk[top++]=u;
        else{
            while (top-2>=0 && dep[stk[top-2]]>=dep[f]){
                addEdge(stk[top-1],stk[top-2]);
                top--;
            }
            if (f!=stk[top-1]){
                addEdge(f,stk[top-1]);
                stk[top-1]=f,points[cnt++]=f,sz[f]=0;
            }
            stk[top++]=u;
        }
    }
    for (int i=top-2;i>=0;i--) addEdge(stk[i],stk[i+1]);
    for (int i=0;i<=m;++i) dp[i]=0;
    dp[0]=1,DP(r,0,0);
    int ans=0;
    for (int i=1;i<=m;++i) up(ans,dp[i]);
    printf("%d\n",ans);
    for (G2[0].clear(),i=0;i<cnt;i++) sz[i]=0;
}
int main(){
    read(n),read(q);
    for (i=1;i<n;i++){
        read(u),read(v);
        G[u].PB(v);
        G[v].PB(u); 
    }
    dfs(1,0),dfs2(1,1);
    for (;q--;){
        read(k),read(m),read(r);
        bool flag=0;
        for (i=0;i<k;i++){
            read(points[i]);
            flag|=points[i]==r;
            isVirtual[points[i]]=1;
        }
        if (!flag) points[k++]=r;
        build(points,k);
        for (i=0;i<k;i++) isVirtual[points[i]]=0;
    }
    return 0;
}
```', 'public', NULL, 'published', '["DP","Data Structure"]', '2019-02-04T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-1139D', 'Codeforces 1139D Steps to One', 'Codeforces 1139D Steps to One', '**题目链接**：[https://codeforces.com/contest/1139/problem/D](https://codeforces.com/contest/1139/problem/D)

**题意**：有一个数组刚开始为空，每次等概率随机一个 $[1,m]$ 的数字加入到数组末尾，当整个数组 $gcd$ 为 $1$ 时停止加入，问期望步长。

**思路**：定义 $dp[x]$ 为整个数组 $gcd$ 为 $x$ 时期望停止的步长，则由全期望公式得转移方程为：

$$
dp[x]=1+\sum_{i=1}^{m}\frac{dp[gcd(i,x)]}{m}
$$

我们把 $gcd(i,x)==x$ 的项移到左边就可以在 $O(m^2)$ 的时间内暴力解出，但这无疑会超时，考虑到 $gcd(i,x)$ 一定是 $x$ 的约数，所以我们可以枚举 $x$ 的约数 $y$ 同时计算出 $\sum_{i=1}^{m}[gcd(i,x)==y]$ 的个数，这是一个经典的反演式子，可以加速计算，最后求出所有 $dp$ 值以后，考虑第一步数组为空，所以由全期望公式就可以得出答案为：

$$
1+\sum_{i=1}^{m}\frac{dp[i]}{m}
$$

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
const int P=1e9+7;
int m,i,j,inv,ans=1,dp[N],mu[N],primes[N];
vector<int>fac[N];
void init(){
    for (mu[1]=1,i=2;i<=1e5;i++){
        if (!primes[i]) primes[++primes[0]]=i,mu[i]=-1;
        for (j=1;j<=primes[0]&&i*primes[j]<=1e5;j++){
            primes[i*primes[j]]=1;
            if (i%primes[j]==0){
                mu[i*primes[j]]=0;
                break;
            }
            else mu[i*primes[j]]=-mu[i];
        }
    }
    for (i=1;i<=1e5;++i){
    	for (j=i*2;j<=1e5;j+=i){
    		fac[j].PB(i);
    	}
    }
}
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
int totCount(int y,int x){
	int cnt=0;
	x/=y;
	for (int i=0;i<(int)fac[x].size();++i){
		int d=fac[x][i];
		int res=mu[d]*(m/y/d);
		if (res<0) res+=P;
		up(cnt,res);
	}
	int res=mu[x]*(m/y/x);
	if (res<0) res+=P;
	up(cnt,res);
	return cnt;
}
int main(){
	init();
	inv=fexp(read(m),P-2);
	for (dp[1]=0,i=2;i<=m;++i){
		int res=1;
		for (j=0;j<(int)fac[i].size();++j){
			int cnt=totCount(fac[i][j],i);
			up(res,1LL*dp[fac[i][j]]*cnt%P*inv%P);
		}
		dp[i]=1LL*res*m%P*fexp(m-m/i,P-2)%P;
		up(ans,1LL*dp[i]*inv%P);
	}
	printf("%d\n",ans);
	return 0;
}
```', 'public', NULL, 'published', '["DP","Math"]', '2019-03-23T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-1140E', 'Codeforces 1140E Palindrome-less Arrays', 'Codeforces 1140E Palindrome-less Arrays', '**题目链接**：[http://codeforces.com/problemset/problem/1140/E](http://codeforces.com/problemset/problem/1140/E)

**题意**：给你一个串，这个串有 $-1$ 或 $[1,k]$ 中的数组成，$-1$ 位置的数未确定，你可以将 $[1,k]$ 中的数填入其中，问有多少种填的方案使得这个串中不包含回文串。

**思路**：有一个性质是只要长度为$3$的回文串没有出现那么其他奇数长度的回文串一定不会出现，所以问题就规约到了如何填保证不出现长度为$3$的回文串，而长度为 $3$ 的回文串又有一个性质是 $a[i]==a[i+2]$，所以奇数位置和偶数位置是互不影响的，我们可以把奇数和偶数位置分别处理，问题有规约成了给你个数组，保证相邻两数不同的填法有多少种。我们定义 $dp[i][0/1]$ 表示有连续 $i$ 个 $-1$ 左右两边字符相等/不相等的方案数，转移方程为 

$$
dp[i][0]=(k-1)dp[i-1][1]
$$ 

$$
dp[i][1]=dp[i-1][0]+(k-2)*dp[i-1][1]
$$

，初始值为 $dp[0][0]=0$(相邻字符不能相等，所以为 $0$)，$dp[0][1]=1$。最后答案就是取出数组连续的 $-1$ 提出来用预处理好的 $dp$ 数组根据乘法原理乘起来就好了，首尾的连续段要特殊处理。

```cpp
#include <bits/stdc++.h>
#define PB emplace_back
#define MP make_pair
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0''||ch>''9'') f|=ch==''-'',ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=2e5+10;
const int P=998244353;
int n,k,i,j,x,a[N],b[N],dp[N][2];
inline void up(int&a,int b){a+=b;if(a>=P)a-=P;}
int fexp(int a,int n){
	int res=1;
	while (n){
		if (n&1) res=1LL*res*a%P;
		a=1LL*a*a%P;
		n>>=1;
	}
	return res;
}
int solve(int a[],int len){
	if (len==0) return 1;
	int cnt,l=1,r=len,ans=0;
	for (;l<=len && a[l]==-1;++l);
	if (l==len+1) return 1LL*k*fexp(k-1,len-1)%P;
	for (;r>=1 && a[r]==-1;--r);
	ans=1LL*fexp(k-1,l-1)*fexp(k-1,len-r)%P;
	for (i=l+1;i<=r-1;i=j+1){
		for (cnt=0,j=i;a[j]==-1;++j) cnt+=1;
		ans=1LL*ans*dp[cnt][a[i-1]!=a[j]]%P;
	}
	return ans;
}
int main(){
	read(n),read(k);
	for (i=1;i<=n;++i){
		read(x);
		if (i&1) a[++a[0]]=x;
		else b[++b[0]]=x;
	}
	for (dp[0][1]=1,i=1;i<=n;++i){
		up(dp[i][0],1LL*dp[i-1][1]*(k-1)%P);
		up(dp[i][1],dp[i-1][0]);
		up(dp[i][1],1LL*dp[i-1][1]*(k-2)%P);
	}
	printf("%d\n",1LL*solve(a,a[0])*solve(b,b[0])%P);
	return 0;
}
```', 'public', NULL, 'published', '["DP"]', '2019-03-20T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-1141G', 'Codeforces 1141G Privatization of Roads in Treeland', 'Codeforces 1141G Privatization of Roads in Treeland', '**题目链接**：[http://codeforces.com/problemset/problem/1141/G](http://codeforces.com/problemset/problem/1141/G)

**题意**：给定一个 $n$ 个点的无根树，现给这个树的边进行染色。定义一个节点是坏点，若满足与该节点相连的至少两条边是相同的颜色，求至多有 $k$ 个坏点的情况下最少需要几种颜色才能进行合法染色。

**思路**：考虑一个点不是坏点的情况，必须满足与之相连的每条边颜色均不同，设最多的点的度数为 $D$。若一个坏点也没有，那么最少肯定需要 $D$ 种颜色，若允许有 $k$ 个坏点，则意味着度数第 $k+1$ 大的节点相连的每条边必须颜色均不同，即：答案为第 $k+1$ 大点的度数。染色直接 $dfs$ 染色即可。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while(ch<''0''||ch>''9'')f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=2e5+10;
vector<pair<int,int> >G[N];
int n,k,u,v,i,ans,deg[N],col[N];
void dfs(int u,int f,int c){
	for (int i=0;i<(int)G[u].size();++i){
		int v=G[u][i].first,id=G[u][i].second;
		if (v==f) continue;
		col[id]=c;
		(c+=1)%=ans;
		dfs(v,u,c);
	}
}
int main(){
	read(n),read(k);
	for (i=1;i<n;++i){
		read(u),read(v);
		G[u].push_back(make_pair(v,i));
		G[v].push_back(make_pair(u,i));
		deg[u]+=1,deg[v]+=1;
	}
	sort(deg+1,deg+1+n);
	reverse(deg+1,deg+1+n);
	ans=deg[k+1];
	dfs(1,0,0);
	printf("%d\n",ans);
	for (i=1;i<n;++i){
		printf("%d%c",col[i]+1,i==n-1?''\n'':'' '');
	}
	return 0;
}
```', 'public', NULL, 'published', '["Greedy"]', '2019-03-20T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-1149B', 'Codeforces 1149B Three Religions', 'Codeforces 1149B Three Religions', '**题目链接**：[http://codeforces.com/problemset/problem/1149/B](http://codeforces.com/problemset/problem/1149/B)

**题意**：给一个主串和三个空子串，$q$ 次操作，每次操作往一个子串后面加一个字符或者把一个子串后面的字符抹掉，问三个子串是否能互不干扰的成为主串的一个子序列，即主串的一个位置只能被一个子串占据，保证子串长度不超过 $250$。

**思路**：先对主串建立序列自动机，$f[i][j][k]$ 表示考虑子串 $1$ 前 $i$ 个字符，子串 $2$ 的前 $j$ 个字符，子串 $3$ 的前 $k$ 个字符，在主串上互不干扰的放置的时候最少需要用主串的前几个字符数，判定只要$f[a][b][c]\le n$ 即可。暴力转移是 $n^3$ 的，但是考虑每次操作只改变一个位置，也就是最多需要更新 $n^2$ 个状态，所以直接转移就好了，删除的时候回退就好了不需要更改，时间复杂度 $O(250^2*q)$。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
int n,q,i,j,k,x,A,B,C,nxt[N][26];
int f[300][300][300];
char op[2],y[2],a[300],b[300],c[300],s[N];
int main(){
	read(n),read(q);
	scanf("%s",s+1);
	for (j=0;j<26;++j) nxt[n][j]=n+1;
	for (i=n;i;--i){
		for (j=0;j<26;++j) nxt[i-1][j]=nxt[i][j];
		nxt[i-1][s[i]-''a'']=i;
	}
	f[0][0][0]=0;
	for (;q--;){
		scanf("%s%d",op,&x);
		if (op[0]==''+''){
			scanf("%s",y);
			if (x==1){
				a[++A]=y[0];
				for (j=0;j<=B;++j){
					for (k=0;k<=C;++k){
						f[A][j][k]=n+1;
						if (A && f[A-1][j][k]<=n) f[A][j][k]=min(f[A][j][k],nxt[f[A-1][j][k]][a[A]-''a'']);
						if (j && f[A][j-1][k]<=n) f[A][j][k]=min(f[A][j][k],nxt[f[A][j-1][k]][b[j]-''a'']);
						if (k && f[A][j][k-1]<=n) f[A][j][k]=min(f[A][j][k],nxt[f[A][j][k-1]][c[k]-''a'']);
					}
				}
			}
			if (x==2){
				b[++B]=y[0];
				for (j=0;j<=A;++j){
					for (k=0;k<=C;++k){
						f[j][B][k]=n+1;
						if (B && f[j][B-1][k]<=n) f[j][B][k]=min(f[j][B][k],nxt[f[j][B-1][k]][b[B]-''a'']);
						if (j && f[j-1][B][k]<=n) f[j][B][k]=min(f[j][B][k],nxt[f[j-1][B][k]][a[j]-''a'']);
						if (k && f[j][B][k-1]<=n) f[j][B][k]=min(f[j][B][k],nxt[f[j][B][k-1]][c[k]-''a'']);
					}
				}
			}
			if (x==3){
				c[++C]=y[0];
				for (j=0;j<=A;++j){
					for (k=0;k<=B;++k){
						f[j][k][C]=n+1;
						if (C && f[j][k][C-1]<=n) f[j][k][C]=min(f[j][k][C],nxt[f[j][k][C-1]][c[C]-''a'']);
						if (j && f[j-1][k][C]<=n) f[j][k][C]=min(f[j][k][C],nxt[f[j-1][k][C]][a[j]-''a'']);
						if (k && f[j][k-1][C]<=n) f[j][k][C]=min(f[j][k][C],nxt[f[j][k-1][C]][b[k]-''a'']);
					}
				}
			}
		}
		else{
			if (x==1) A--;
			if (x==2) B--;
			if (x==3) C--;
		}
		puts(f[A][B][C]<=n?"YES":"NO");
	}
	return 0;
}
```', 'public', NULL, 'published', '["DP","String"]', '2019-04-30T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-311B', 'Codeforces 311B Cats Transport', 'Codeforces 311B Cats Transport', '**题目链接**：[http://codeforces.com/contest/311/problem/B](http://codeforces.com/contest/311/problem/B)

**题意**：$m$ 只猫，放在 $[1,n]$ 中的一个位置 $h_i$，且到 $t_i$ 以后才能被接走，每个位置之间的距离 $d_i$ 已知，现在你可以规划 $p$ 个人任意时间从 $1$ 号位置开始走，移动速度是一个单位，要求接走所有的猫，最小化猫等待的时间，人出发的时间可以为负数。

**思路**：对于每只猫，设 $a_i=t_i-\sum_{j=1}^{h_i}$，一个人如果想接到这只猫，就必须在 $a_i$ 以后出发，假设出发时间为 $t$，则这只猫的等待时间就是 $t-a_i$。我们将 $a_i$ 排序，则每个人带走的猫一定是排序后连续的一段，则我们可以根据这个列出方程，设 $dp[i][j]$ 为前 $i$ 个人带走前 $j$ 只猫，猫等待时间最小的总和，假设第 $i$ 个人带走 $[k+1,j]$ 的猫，那么这个人出发的最早时间就是 $a_j$，这些猫等待时间之和为 $\sum_{p=k+1}^{j}(a_j-a_p)=a_j\times (j-k)-(S_j-S_k)$, $S_k$ 为 $a$ 数组的前缀和，最后状态转移方程就是

$$
dp[i][j]=min(dp[i-1][k]+a_j\times (j-k)-(S_j-S_k))
$$

直接转移是 $O(pm^2)$ 的，需要优化，我们把 $min$ 去掉，式子做下变换得，

$$
dp[i-1][k]+S_k=a_j\times k+dp[i][j]-a_j\times j
$$

以 $k$ 为横坐标，$dp[i-1][k]+S_k$ 为纵坐标建立平面直角坐标系，上式就是一条以 $a_j$ 为斜率，$dp[i][j]-a_j\times j$ 为截距的直线，当截距最小化的时候 $dp[i][j]$ 取到最小值，应该维护一个下凸壳，因为直线斜率单调递增，且决策点横坐标也是单调递增，直接单调队列维护决策点即可，时间复杂度 $O(pm)$。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
int n,m,p,l,r,h,t,i,j,q[N];
ll d[N],a[N],S[N],dp[105][N];
inline ll getAns(int i,int j,int k){return dp[i-1][k]+a[j]*(j-k)-(S[j]-S[k]);}
inline ll getY(int i,int k){return dp[i-1][k]+S[k];}
int main(){
	read(n),read(m),read(p);
	for (i=2;i<=n;++i){
		read(d[i]);
		d[i]+=d[i-1];
	}
	for (i=1;i<=m;++i){
		read(h),read(t);
		a[i]=t-d[h];
	}
	sort(a+1,a+1+m);
	for (i=1;i<=m;++i) S[i]=S[i-1]+a[i];
	memset(dp,0x3f,sizeof(dp));
	for (dp[0][0]=0,i=1;i<=p;++i){
		q[l=r=1]=0;
		for (j=1;j<=m;++j){
			while (l<r && getY(i,q[l+1])-getY(i,q[l])<=a[j]*(q[l+1]-q[l])) l++;
			dp[i][j]=min(dp[i-1][j],getAns(i,j,q[l]));
			while (l<r && (getY(i,q[r])-getY(i,q[r-1]))*(j-q[r])>=(getY(i,j)-getY(i,q[r]))*(q[r]-q[r-1])) r--;
			q[++r]=j;
		}
	}
	printf("%lld\n",dp[p][m]);
	return 0;
}
```', 'public', NULL, 'published', '["DP"]', '2019-04-12T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-444C', 'Codeforces 444C DZY Loves Colors', 'Codeforces 444C DZY Loves Colors', '**题目链接**：[http://codeforces.com/problemset/problem/444/C](http://codeforces.com/problemset/problem/444/C)

**题意**：给定一个序列，$i$ 位置的颜色值是 $color_i$，有两个操作，操作一将 $[L,R]$ 内的颜色都修改为 $x$，同时对于位置 $i$，当它的颜色改为 $x$ 的时候，这个位置的价值增加 $|x-color_i|$，操作二询问区间 $[L,R]$ 的价值和。

**思路**：考虑到如果不断进行操作 $1$ 的话最后会变成一段段的颜色，那么我们进行分块，弄个标记维护块内是否颜色都一样，如果颜色都一样的话修改的时候直接整块打个标记即可，如果不一样则暴力修改，修改的时候对于不完整的块直接暴力修改，均摊下来时间复杂度不会很大，大概 $O(n\sqrt n)$。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while(ch<''0''||ch>''9'')f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
int n,m,sz,i,op,l,r,x,flag[N],block[N],color[N];
ll val[N],sum[N],tag[N];
#define umin(a,b) (a>b?b:a)
void reset(int x){
    if (flag[x]==-1) return;
    for (int i=(x-1)*sz+1;i<=umin(x*sz,n);i++){
        color[i]=flag[x];
    }
    flag[x]=-1;
}
void update(int a,int b,int x){
    int i,j;
    reset(block[a]);
    for (i=a;i<=umin(block[a]*sz,b);i++){
        val[i]+=abs(color[i]-x);
        sum[block[i]]+=abs(color[i]-x);
        color[i]=x;
    }
    if (block[a]!=block[b]){
        reset(block[b]);
        for (i=(block[b]-1)*sz+1;i<=b;i++){
            val[i]+=abs(color[i]-x);
            sum[block[i]]+=abs(color[i]-x);
            color[i]=x;
        }
    }
    for (i=block[a]+1;i<=block[b]-1;i++){
        if (flag[i]!=-1){
            tag[i]+=abs(flag[i]-x);
            flag[i]=x;
        }
        else{
            for (j=(i-1)*sz+1;j<=i*sz;j++){
                val[j]+=abs(color[j]-x);
                sum[i]+=abs(color[j]-x);
                color[j]=x;
            }
            flag[i]=x;
        }
    }
}
ll query(int a,int b){
    ll res=0,i;
    for (i=a;i<=umin(block[a]*sz,b);i++) res+=val[i]+tag[block[i]];
    if (block[a]!=block[b]){
        for (i=(block[b]-1)*sz+1;i<=b;i++) res+=val[i]+tag[block[i]];
    }
    for (i=block[a]+1;i<=block[b]-1;i++) res+=sum[i]+tag[i]*sz;
    return res;
}
int main(){
    read(n),read(m),sz=sqrt(n+0.5);
    for (i=1;i<=n;i++) color[i]=i,block[i]=(i-1)/sz+1,flag[block[i]]=-1;
    for (i=1;i<=m;i++){
        read(op),read(l),read(r);
        if (op==1){
            read(x);
            update(l,r,x);
        }
        else{
            printf("%lld\n",query(l,r));
        }
    }
    return 0;
}
```', 'public', NULL, 'published', '["Sqrt Algorithm"]', '2018-03-04T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-55D', 'Codeforces 55D Beautiful numbers', 'Codeforces 55D Beautiful numbers', '**题目链接**:[https://codeforces.com/problemset/problem/55/D](https://codeforces.com/problemset/problem/55/D)

**题意**:输出 $[L,R]$ 中满足这个数对它自己每一位非零数字都整除的数的个数.

**思路**:刚开始想了枚举数的集合然后数位 $DP$ 但是实在是太慢了...看了题解才知道我们已知 $1..9$ 的最小公倍数是 $2520$,那么我们假设要求数 $x$ 模 $y$ 是等于 $0$ 的,然后我们改写 $x$ 为 $x=x\bmod 2520+2520\times k$ 已知 $2520$ 一定整除 $y$ 所以问题就转化成 $x\bmod 2520$ 是否整除它数位上的每一个非零的数字,定义 $dp[i][j][S][k]$ 表示从高到低考虑前 $i$ 个数位模 $2520$ 为 $j$,已经出现的非零的数字集合为 $S$,当前 $i$ 是否等于 $n$ 的情况为 $k$ 的方案数然后 $DP$,记忆化搜索去掉最后一维去搜索即可,注意到什么数都整除 $1$ 所以只要考虑 $[2,9]$ 即可.

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int P=2520;
int T,status,i,digit[20];
ll l,r,ans,dp[20][256][2520];
ll dfs(int pos,int S,int num,bool jud){
	if (!pos){
		for (int i=0;i<8;++i)if(S&(1<<i)){
			if (num%(i+2)) return 0;
		}
		return 1;
	}
	if (!jud && ~dp[pos][S][num]) return dp[pos][S][num];
	int limit=jud?digit[pos]:9;
	ll ret=0;
	for (int i=0;i<=limit;++i){
		ret+=dfs(pos-1,i>1?S|(1<<(i-2)):S,(num*10+i)%P,jud && i==limit);
	}
	if (!jud) dp[pos][S][num]=ret;
	return ret;
}
ll cal(ll x){
	if (!x) return 1;
	int len=0;
	while (x){
		digit[++len]=x%10;
		x/=10;
	}
	return dfs(len,0,0,1);
}
int main(){
	memset(dp,-1,sizeof(dp));
	for (read(T);T--;){
		read(l),read(r);
		printf("%lld\n",cal(r)-cal(l-1));
	}
	return 0;
}
```', 'public', NULL, 'published', '["DP"]', '2018-08-01T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-570D', 'Codeforces 570D Tree Requests', 'Codeforces 570D Tree Requests', '**题目链接**：[http://codeforces.com/problemset/problem/570/D](http://codeforces.com/problemset/problem/570/D)

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
    while(ch<''0''||ch>''9'')_f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
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
    F[dep[u]]^=(1<<(s[u]-''a''));
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

```', 'public', NULL, 'published', '["Dsu on Tree"]', '2017-12-27T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-613D', 'Codeforces 613D Kingdom and its Cities', 'Codeforces 613D Kingdom and its Cities', '**题目链接**：[http://codeforces.com/contest/613/problem/D](http://codeforces.com/contest/613/problem/D)

**题意**：$n$ 个点的树，若干询问，每次询问给出 $k_i$ 个关键点，要求抹去最少的非关键点使关键点两两无法到达，如果没有办法则输出 $-1$,$\sum k_i \le 10000$。

**思路**：首先如果一条边两个端点都是关键点肯定无解，可以特判，然后考虑朴素的树形 $DP$，假设这个点是关键点，那么一定要抹去儿子子树里有一个关键点的儿子节点，如果是非关键节点而且只有一个关键点的子树数量或者子节点就是关键点的数量之和超过 $1$ 就要把这个关键点抹去，然后询问数量很多考虑建虚树即可，时间复杂度 $O((n+\sum k_i)\log n)$。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=1e5+10;
const int INF=2000000000;
int n,i,u,v,q,k,top,dfs_clock,dfn[N],points[N],bel[N],fa[N],son[N],sz[N],dep[N];
bool isVirtual[N];
vector<int>G[N],G2[N];
void dfs(int u,int f){
	fa[u]=f,dep[u]=dep[f]+1,sz[u]=1,son[u]=-1,dfn[u]=++dfs_clock;
	for (auto &v:G[u]){
		if (v==f) continue;
		dfs(v,u);
		sz[u]+=sz[v];
		if (son[u]==-1 || sz[v]>sz[son[u]]) son[u]=v;
	}
}
void dfs2(int u,int f){
	bel[u]=f;
	if (son[u]==-1) return;
	dfs2(son[u],f);
	for (auto &v:G[u]){
		if (v==fa[u] || v==son[u]) continue;
		dfs2(v,v);
	}
}
int lca(int u,int v){
	for (;bel[u]!=bel[v];dep[bel[u]]>dep[bel[v]]?u=fa[bel[u]]:v=fa[bel[v]]);
	return dep[u]>dep[v]?v:u;
}
void addEdge(int u,int v){
	G2[u].PB(v);
	G2[v].PB(u);
}
int dp(int u,int f){
	int ans=0,tot=0;
	for (auto &v:G2[u]){
		if (v==f) continue;
		ans+=dp(v,u);
		tot+=sz[v];
	}
	if (isVirtual[u]){
		ans+=tot;
		sz[u]=1;
	}
	else{
		if (tot>1) ans++;
		if (tot==1) sz[u]=1;
		else sz[u]=0;
	}
	G2[u].clear();
	return ans;
}
inline bool cmp(const int&a,const int&b){return dfn[a]<dfn[b];}
void build(int points[],int k){
	static int stk[N];
	sort(points,points+k,cmp);

	top=0,stk[top++]=0;
	int cnt=k;
	for (int i=0;i<k;i++){
		int u=points[i],f=lca(u,stk[top-1]);
		if (f==stk[top-1]) stk[top++]=u;
		else{
			while (top-2>=0 && dep[stk[top-2]]>=dep[f]){
				addEdge(stk[top-1],stk[top-2]);
				top--;
			}
			if (f!=stk[top-1]){
				addEdge(f,stk[top-1]);
				stk[top-1]=f,points[cnt++]=f,sz[f]=0;
			}
			stk[top++]=u;
		}
	}
	for (int i=top-2;i>=0;i--) addEdge(stk[i],stk[i+1]);
	printf("%d\n",dp(stk[1],0));
	for (G2[0].clear(),i=0;i<cnt;i++) sz[i]=0;
}
int main(){
	read(n);
	for (i=1;i<n;i++){
		read(u),read(v);
		G[u].PB(v);
		G[v].PB(u);	
	}
	dfs(1,0),dfs2(1,1);
	for (read(q);q--;){
		read(k);
		for (i=0;i<k;i++){
			read(points[i]);
			isVirtual[points[i]]=1;
		}
		bool flag=0;
		for (i=0;i<k;i++){
			if (fa[points[i]]!=points[i] && isVirtual[fa[points[i]]]==1){
				flag=1;
				break;
			}
		}
		if (flag) puts("-1");
		else build(points,k);
		for (i=0;i<k;i++) isVirtual[points[i]]=0;
	}
	return 0;
}
```', 'public', NULL, 'published', '["DP","Data Structure"]', '2018-09-05T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-678F', 'Codeforces 678F Lena and Queries', 'Codeforces 678F Lena and Queries', '**题目链接**：[http://codeforces.com/contest/678/problem/F](http://codeforces.com/contest/678/problem/F)

**题意**：维护一个点集，要求支持加入和删除的操作，以及能够给定 $x$，找出在点集中的一个点使得 $a\times x+b$ 最大化。

**思路**：首先不考虑加入删除操作，即已知一个点集我们怎么快速找到要求的最大值，而这个就是用到了[Convex Hull Trick](http://wcipeg.com/wiki/Convex_hull_trick),大概讲就是把 $a$ 看成斜率，$b$ 看成截距，那么对应的点集就对应了二维平面上对应的线，我们要做的就是在 $x=x_0$ 这条直线上找到最大的 $y$，我们把每个点对应的最大值连线连起来可以发现这构成了一个下凸壳，所以我们只要对原来的点集求出下凸壳，那么就可以通过二分来找答案了，构造下凸壳的过程就是把所有线按斜率从小到大排序然后用单调栈维护即可。现在考虑加入和删除操作，那么用到了一个技巧就是把这个加入和删除操作当成该点对应的生存区间，我们可以建立以时间为下标的线段树，然后把能生存的节点都加入这个点，但是如果该节点对应的区间完全包含在生存区间里的时候就不再下传，然后对每个节点都求一个下凸壳，查询的时候就从根节点往下走，边走边在这个节点查询最值并更新即可，因为我们要走的区间一定是包含我们查询的时间的点，而我们的区间的含义就是在这一段时间能存活下来的点，这样的话就说明我们查询的时间的点所需要的点集我们都能包括进去，所以是正确的，时间复杂度是 $O(n\log^2n)$ 的，因为每次走节点的时候查询也是带一个 $log$ 的。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=3e5+10;
const int DEL=1e9+7;
const ll INF=2000000000000000000LL;
struct Line{
	int k,b;
	Line(){}
	Line(int k,int b):k(k),b(b){}
	bool operator<(const Line&rhs)const{
		return k^rhs.k?k<rhs.k:b<rhs.b;
	}
	ll f(int x){return (ll)k*x+b;}
};
vector<Line>T[N<<2];
pair<int,int>seg[N],op[N];
int n,t,c,i,cnt,S[N];
ll res;
#define lson root<<1,l,mid
#define rson root<<1|1,mid+1,r
void add(int root,int l,int r,int L,int R,Line a){
	if (L<=l&&r<=R){
		T[root].PB(a);
		return;
	}
	int mid=l+((r-l)>>1);
	if (L<=mid) add(lson,L,R,a);
	if (mid<R) add(rson,L,R,a);
}
bool check(vector<Line>& v,int i,int j,int k){
	return (ll)(v[i].b-v[j].b)*(v[k].k-v[i].k)>=(ll)(v[i].b-v[k].b)*(v[j].k-v[i].k);
}
void calc(vector<Line>&T){
	int i,t;
	sort(T.begin(),T.end());
	for (i=0,t=0;i<(int)T.size();++i){
		while ((t&&T[S[t]].k==T[i].k)||(t>1&&check(T,S[t-1],S[t],i))) t--;
		S[++t]=i;
	}
	vector<Line> nxt;
	for (i=1;i<=t;i++) nxt.PB(T[S[i]]);
	T=nxt;
}
ll get(int x,int root){
	if (!T[root].size()) return -INF;
	int l=0,r=(int)T[root].size()-2,res=0;
	while (l<=r){
		int mid=l+((r-l)>>1);
		if (T[root][mid].f(x)<=T[root][mid+1].f(x)){
			l=mid+1;
			res=mid+1;
		}
		else r=mid-1;
	}
	return T[root][res].f(x);
}
void query(int root,int l,int r,int pos,int x){
	res=max(res,get(x,root));
	if (l==r) return;
	int mid=l+((r-l)>>1);
	if (pos<=mid) query(lson,pos,x);
	else query(rson,pos,x);
}
int main(){
	read(n);
	for (i=1;i<=n;++i){
		read(c),read(seg[i].first);
		if (c==1) read(seg[i].second);
		else if (c==2){
			int x=seg[i].first;
			add(1,1,n,x,i,Line(seg[x].first,seg[x].second));
			seg[x].first=seg[i].first=DEL;
		}
		else op[++cnt]=MP(seg[i].first,i),seg[i].first=DEL;
	}
	for (i=1;i<=n;++i)if(seg[i].first!=DEL){
		add(1,1,n,i,n,Line(seg[i].first,seg[i].second));
	}
	for (i=1;i<=(n<<1);++i)if(T[i].size())calc(T[i]);
	for (i=1;i<=cnt;++i){
		res=-INF;
		query(1,1,n,op[i].second,op[i].first);
		if (res==-INF) puts("EMPTY SET");
		else printf("%lld\n",res);
	}
	return 0;
}
```', 'public', NULL, 'published', '["Segment Tree","Geometry"]', '2018-07-22T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-707D', 'Codeforces 707D Persistent Bookcase', 'Codeforces 707D Persistent Bookcase', '**题目链接**：[http://codeforces.com/contest/707/problem/D](http://codeforces.com/contest/707/problem/D)

**题意**：$1.(x,y)$ 置 $1$; $2.(x,y)$ 置 $0$; $3.$ 第 $x$ 行按位取反; $4.$ 退回到第 $k$ 个操作时的样子，每次操作完以后输出棋盘上 $1$ 的个数。

**思路**：好题，离线思路很妙，把每个操作看成一个树上的节点，如果我第 $i$ 个操作是要退回到第 $k$ 个操作，那就 $k->i$，否则就是 $i-1->i$，然后这就成了一个树的形状，我们直接在树上 $dfs$，回溯的时候撤销操作即可，这样就解决了可持久化的问题，然后翻转什么的用 $bitset$ 加速即可。

```cpp
#include<bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&& ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
struct Node{int tp,x,y;}t[N];
bitset<1005>maze[1005];
int n,m,q,i,j,num,ans[N];
vector<int>G[N];
void deal(int o,int& vaild){
	int k=t[o].tp,x=t[o].x,y=t[o].y;
	if (k==1){
		if (!maze[x][y]) maze[x][y]=1,num++,vaild=1;
		else vaild=0;
	}
	if (k==2){
		if (maze[x][y]) maze[x][y]=0,num--,vaild=1;
		else vaild=0;
	}
	if (k==3){
		int cnt=maze[x].count();
		if (maze[x][1004]==1) cnt-=(1005-m);
		num=num-cnt+(m-cnt);
		maze[x]=~maze[x];
	}
}
void cancel(int o,int&vaild){
	int k=t[o].tp,x=t[o].x,y=t[o].y;
	if (k==1){
		if (vaild) maze[x][y]=0,num--;
	}
	if (k==2){
		if (vaild) maze[x][y]=1,num++;
	}
	if (k==3){
		int cnt=maze[x].count();
		if (maze[x][1004]==1) cnt-=(1005-m);
		num=num-cnt+(m-cnt);
		maze[x]=~maze[x];
	}
}
void dfs(int x){
	int vaild;
	if (x) deal(x,vaild),ans[x]=num;
	for (int i=0;i<(int)G[x].size();++i){
		int v=G[x][i];
		dfs(v);
	}
	if (x) cancel(x,vaild);
}
int main(){
	read(n),read(m),read(q);
	for (i=1;i<=q;++i){
		read(t[i].tp);
		if (t[i].tp<=2) read(t[i].x),read(t[i].y);
		else read(t[i].x);
	}
	G[0].PB(1);
	for (i=2;i<=q;++i){
		if (t[i].tp<4) G[i-1].PB(i);
		else G[t[i].x].PB(i);
	}
	dfs(0);
	for (i=1;i<=q;++i) printf("%d\n",ans[i]);
	return 0;
}
```', 'public', NULL, 'published', '["Bitmasks"]', '2018-10-19T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-786A', 'Codeforces 786A Berzerk', 'Codeforces 786A Berzerk', '**题目链接**：[http://codeforces.com/contest/786/problem/A](http://codeforces.com/contest/786/problem/A)

**题意**：有 $n$ 个点排成一个环，$1$ 号点是一个黑洞，有个怪物在其中的某个点上，$Alice$ 和 $Bob$ 轮流从自己的集合中拿一个数 $x$ 出来让怪物顺时针走 $x$ 步，如果某个人操作完以后这个怪物走进了黑洞那么这个人就赢了，假设两个人都足够聪明，对于每个位置每个人先手的情况输出对应的结局(赢，输，平局)。

**思路**：这是一个不平等的博弈，它与公平组合游戏的区别就是玩家每一步的可移动到的状态是不同的，题目中两个玩家的集合里的数不同所以可以移动到的下一个状态也是不同的，对于不平等的博弈我们设定的状态要是当前的游戏局面以及轮到谁走了，貌似也是适用必胜必败态的，解这类博弈好像会用到超自然数什么东西且 $SG$ 定理在这里是失效的，但具体的论文还没看，这里主要是用到了必胜必败态。回到本题，我们还注意到这个游戏也是一个有可能无法终止的博弈，对于解决这类博弈我们的技巧就是找到停止的状态，然后反向 $BFS$ 或者 $DFS$ 标记状态，如果当前点是必败态，那么反向能走到的所有状态就是必胜态，如果当前点是必胜态，考虑反向走到的点的度数，如果这个点的后继有一个必胜态，度数就减一，如果为 $0$ 了就说明这个点的后继状态全是必胜态，那么这个点就是必败态了，最后到不了的没有被标记的状态无疑就是平局的状态了，这样问题就解决了。


```cpp
#include <bits/stdc++.h>
using namespace std;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
```', 'public', NULL, 'published', '["Number Theory","BFS"]', '2018-04-06T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-834D', 'Codeforces 834D The Bakery', 'Codeforces 834D The Bakery', '**题目链接**：[http://codeforces.com/problemset/problem/834/D](http://codeforces.com/problemset/problem/834/D)

**题意**：给定一个序列，将其划分成 $K$ 段，一段的价值是数的种类，求最大价值。

**思路了**：先列出个显然的 $DP$ 方程，$dp[i][j]=max(dp[k-1][j-1]+val[k][i])$，$dp[i][j]$ 表示前 $i$ 个数划分成 $j$ 段的最大价值，则我们最终要的答案就是 $dp[n][k]$，暴力转移 $O(kn^2)$ 肯定 $TLE$，所以要想想优化。考虑到从 $i->i+1$ 最多只改变一段的价值，所以我们先预处理出这个位置的数之前出现的位置，设为 $k$，那么我们只要更新 $[k+1,i+1]$ 这一段的值就可以了。每次决策时，建立线段树维护上一次决策 $dp$ 价值的最大值，位置 $i$ 存的是 $dp[i-1][j-1]$。然后从 $i->i+1$ 的时候区间更新 $[pre[v[i+1]]+1,i+1]$，这时候显然 $dp[k-1][j-1]$ 的值变成了 $dp[k-1][j-1]+val[k][i]$，查询前缀最值更新答案就可以了，时间复杂度 $O(nklogn)$。

```cpp
const int N=35000+10;
int n,k,i,j,a[N],last[N],pre[N],dp[N][55],mx[N<<2],tag[N<<2];
void pushup(int root){mx[root]=max(mx[root<<1],mx[root<<1|1]);}
void pushdown(int root){
    if (tag[root]){
        mx[root<<1]+=tag[root];
        mx[root<<1|1]+=tag[root];
        tag[root<<1]+=tag[root];
        tag[root<<1|1]+=tag[root];
        tag[root]=0;
    }
}
void build(int root,int l,int r,int index){
    tag[root]=0;
    if (l==r){
        mx[root]=dp[l-1][index];
        return;
    }
    int mid=l+((r-l)>>1);
    build(lson,index);
    build(rson,index);
    pushup(root);
}
void update(int root,int l,int r,int L,int R){
    if (L<=l && r<=R){
        mx[root]++;
        tag[root]++;
        return;
    }
    pushdown(root);
    int mid=l+((r-l)>>1);
    if (L<=mid) update(lson,L,R);
    if (mid<R) update(rson,L,R);
    pushup(root);
}
int query(int root,int l,int r,int L,int R){
    if (L<=l && r<=R) return mx[root];
    pushdown(root);
    int mid=l+((r-l)>>1);
    int ret=0;
    if (L<=mid) ret=max(ret,query(lson,L,R));
    if (mid<R) ret=max(ret,query(rson,L,R));
    pushup(root);
    return ret;
}
int main(){
    read(n),read(k);
    for (i=1;i<=n;i++){
        read(a[i]);
        last[i]=pre[a[i]],pre[a[i]]=i;
    }
    for (i=1;i<=k;i++){
        build(1,1,n,i-1);
        for (j=1;j<=n;j++){
            update(1,1,n,last[j]+1,j);
            dp[j][i]=query(1,1,n,1,j);
        }
    }
    printf("%d\n",dp[n][k]);
    return 0;
}
```', 'public', NULL, 'published', '["Segment Tree","DP"]', '2018-02-07T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-86C', 'Codeforces 86C Genetic engineering', 'Codeforces 86C Genetic engineering', '**题目链接**：[http://codeforces.com/contest/86/problem/C](http://codeforces.com/contest/86/problem/C)

**题意**：要求构造一个串，使得这个串是由所给的串相连接构成，连接可以有重叠的部分。

**思路**：首先用所给的串建立 $AC$ 自动机，每个单词节点记录当前节点能够达到的最长后缀。然后考虑 $DP$，$dp[i][j][k]$ 表示长度为 $i$ 的串走到 $j$ 节点结尾有 $k$ 个字符没有被覆盖的方案数，转移方程分两种情况，如果这个节点能到达最长的后缀长度大于等于 $k+1$，则转移到 $dp[i][son[j][l]][0]$，否则转移到 $dp[i][son[j][i]][k+1]$，因为每个位置都要有串覆盖，然后就可以了。

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=1000+10;
const int M=100+10;
const int P=1000000009;
int n,m,status,i,j,k,l,num,tot,fail[M],cnt[M],dp[N][M][12],son[M][4],q[2000000];
char s[N];
int getId(char ch){
	switch (ch){
		case ''A'':return 0;
		case ''C'':return 1;
		case ''G'':return 2;
		case ''T'':return 3;
	}
}
void ins(char* s,int len){
	int p=0;
	for (int i=0;s[i];++i){
		int idx=getId(s[i]);
		if (!son[p][idx]) son[p][idx]=++tot;
		p=son[p][idx];
	}
	cnt[p]=len;
}
void getFail(){
	int head=0,tail=0;
	for (i=0;i<4;++i){
		if (son[0][i]) q[tail++]=son[0][i];
	}
	for (;head!=tail;){
		int u=q[head++];
		for (i=0;i<4;++i){
			if (!son[u][i]) son[u][i]=son[fail[u]][i];
			else{
				fail[son[u][i]]=son[fail[u]][i];
				cnt[son[u][i]]=max(cnt[son[u][i]],cnt[fail[son[u][i]]]);
				q[tail++]=son[u][i];
			}
		}
	}
}
inline void up(int&a,int b){a+=b;if(a>=P)a-=P;}
void solve(){
	int ans=0;
	for (dp[0][0][0]=1,i=0;i<n;++i) for (k=0;k<10;++k) for (j=0;j<=tot;++j) for (l=0;l<4;++l){
		if (cnt[son[j][l]]>=k+1) up(dp[i+1][son[j][l]][0],dp[i][j][k]);
		else up(dp[i+1][son[j][l]][k+1],dp[i][j][k]);
	}
	for (i=0;i<=tot;++i) up(ans,dp[n][i][0]);
	printf("%d\n",ans);
}
int main(){
	scanf("%d%d",&n,&m);
	for (num=0,i=1;i<=m;++i){
		scanf("%s",s);
		ins(s,strlen(s));
	}
	getFail();
	solve();
	return 0;
}
```', 'public', NULL, 'published', '["AC Automaton","DP"]', '2018-09-29T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-914D', 'Codeforces 914D Bash and a Tough Math Puzzle', 'Codeforces 914D Bash and a Tough Math Puzzle', '**题目链接**：[http://codeforces.com/problemset/problem/914/D](http://codeforces.com/problemset/problem/914/D)

**题意**:给一个序列，支持两个操作，一个操作是单点修改，另一个操作是询问区间 $[L,R]$ 是否能通过修改至多一个点的值使区间的 $GCD==x$。

**思路**：线段树维护区间 $gcd$。如果区间 $gcd$ 为 $x$，有个前提条件是区间内每个数都可以表示成 $x * k$ 的形式，$k$ 为任意正整数，若满足最多有一个不是 $x$ 的倍数的话，我们就可以直接把那个不是 $x$ 的倍数直接改成 $x$ 就可以保证最后区间 $gcd$ 为 $x$ 了，所以我们在线段树上搜索找区间 $[L,R]$ 内不是 $x$ 倍数的数的个数，如果当前节点 $gcd$ 值是 $x$ 的倍数则没有必要往下搜索，直接返回，若最后答案小于等于 $1$，则满足条件。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
using namespace std;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=5e5+10;
int n,i,op,l,r,q,x,g[N<<2];
#define lson root<<1,l,mid
#define rson root<<1|1,mid+1,r
void pushup(int root){g[root]=__gcd(g[root<<1],g[root<<1|1]);}
void build(int root,int l,int r){
    if (l==r){
        read(g[root]);
        return;
    }
    int mid=l+((r-l)>>1);
    build(lson);
    build(rson);
    pushup(root);
}
void update(int root,int l,int r,int x,int v){
    if (l==r){
        g[root]=v;
        return;
    }
    int mid=l+((r-l)>>1);
    if (x<=mid) update(lson,x,v);
    else update(rson,x,v);
    pushup(root);
}
void query(int root,int l,int r,int L,int R,int x,int&res){
    if (res>=2) return;
    if (l==r){
        if (g[root]%x!=0) res++;
        return;
    }
    int mid=l+((r-l)>>1);
    if (L<=l&&r<=R){
        if (g[root<<1]%x!=0) query(lson,L,R,x,res);
        if (g[root<<1|1]%x!=0) query(rson,L,R,x,res);
        return;
    }
    if (L<=mid) query(lson,L,R,x,res);
    if (mid<R) query(rson,L,R,x,res);
}
int main(){
    read(n);
    build(1,1,n);
    for (read(q);q--;){
        read(op),read(l),read(r);
        if (op==1){
            read(x);
            int res=0;
            query(1,1,n,l,r,x,res);
            if (res>1) puts("NO");
            else puts("YES");
        }
        else update(1,1,n,l,r);
    }
    return 0;
}

```', 'public', NULL, 'published', '["Segment Tree"]', '2018-03-04T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-916E', 'Codeforces 916E Jamie and Tree', 'Codeforces 916E Jamie and Tree', '**题目链接**:[http://codeforces.com/contest/916/problem/E](http://codeforces.com/contest/916/problem/E)

**题意**：给你一棵树节点有点权，根节点为$1$要求支持如下操作:$1.$ 换根为 $v$; $2.$ $u,v$ 最近公共祖先为节点的子树里的值全部加 $x$; $3.$ 查询 $u$ 子树里的点权和。

**思路**：

- 对于换根意义下的操作我们要进行分类讨论，假设我们已经预处理出以$1$为根的所有信息，当根换成$r$而对$k$的子树进行操作时，我们分三类来讨论：$1.$ $k==r$ 时对整棵树操作; $2.$ $r$ 在 $k$ 的子树内时，先对整棵树操作再对 $k$ 包含 $r$ 的儿子的子树进行一次撤销操作; $3.$ 直接对 $k$ 为根的子树进行操作。
- 如果要求换根意义下的 $lca$，我们可以先求出 $r$ 和 $u$ 的 $lca$，记为 $z_1$，$r$ 和 $v$ 的 $lca$,记为 $z_2$，如果 $z_1==z_2$，那么 $lca$ 即为 $lca(u,v)$，否则为 $z_1,z_2$ 中较深的那个。
- 剩下的就是 $dfs$ 序加线段树维护信息就好了。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=1e5+10;
int n,q,i,rt,op,u,v,x,dfs_clock,a[N],rk[N],L[N],R[N],fa[N],son[N],sz[N],dep[N],bel[N];
ll sum[N<<2],tag[N<<2];
vector<int>G[N];
void dfs(int u,int f){
	dep[u]=dep[f]+1,son[u]=-1,sz[u]=1,fa[u]=f;
	for (int i=0;i<(int)G[u].size();i++){
		int v=G[u][i];
		if (v==f) continue;
		dfs(v,u);
		sz[u]+=sz[v];
		if (son[u]==-1 || sz[son[u]]<sz[v]) son[u]=v;
	}
}
void dfs2(int u,int f){
	bel[u]=f;
	L[u]=R[u]=++dfs_clock;
	rk[dfs_clock]=u;
	if (son[u]==-1) return;
	dfs2(son[u],f);
	for (int i=0;i<(int)G[u].size();i++){
		int v=G[u][i];
		if (v==fa[u]||v==son[u]) continue;
		dfs2(v,v);
	}
	R[u]=dfs_clock;
}
int lca(int u,int v){
	for (;bel[u]!=bel[v];dep[bel[u]]>dep[bel[v]]?u=fa[bel[u]]:v=fa[bel[v]]);
	return dep[u]>dep[v]?v:u;
}
int LCA(int u,int v,int r){
	int z1=lca(u,r),z2=lca(v,r);
	if (z1==z2) return lca(u,v);
	return dep[z1]>dep[z2]?z1:z2;
}
int LA(int u,int deep){
	for (;dep[bel[u]]>deep;u=fa[bel[u]]);
	return rk[L[u]+deep-dep[u]];
}
bool contain(int u,int v){return L[u]<=L[v]&&R[v]<=R[u];}
#define lson root<<1,l,mid
#define rson root<<1|1,mid+1,r
void pushup(int root){sum[root]=sum[root<<1]+sum[root<<1|1];}
void pushdown(int root,int len){
	if (tag[root]){
		sum[root<<1]+=tag[root]*(len-(len>>1));
		sum[root<<1|1]+=tag[root]*(len>>1);
		tag[root<<1]+=tag[root];
		tag[root<<1|1]+=tag[root];
		tag[root]=0;
	}
}
void build(int root,int l,int r){
	if (l==r){
		sum[root]=a[rk[l]];
		return;
	}
	int mid=l+((r-l)>>1);
	build(lson);
	build(rson);
	pushup(root);
}
void update(int root,int l,int r,int L,int R,int val){
	if (L<=l&&r<=R){
		sum[root]+=(ll)val*(r-l+1);
		tag[root]+=val;
		return;
	}
	pushdown(root,r-l+1);
	int mid=l+((r-l)>>1);
	if (L<=mid) update(lson,L,R,val);
	if (mid<R) update(rson,L,R,val);
	pushup(root);
}
ll query(int root,int l,int r,int L,int R){
	if (L<=l&&r<=R) return sum[root];
	pushdown(root,r-l+1);
	int mid=l+((r-l)>>1);
	ll ret=0;
	if (L<=mid) ret+=query(lson,L,R);
	if (mid<R) ret+=query(rson,L,R);
	pushup(root);
	return ret; 
}
int main(){
	read(n),read(q);
	for (i=1;i<=n;i++) read(a[i]);
	for (i=1;i<n;i++){
		read(u),read(v);
		G[u].push_back(v);
		G[v].push_back(u);
	}
	dfs(1,0);
	dfs2(1,1);
	build(1,1,n);
	rt=1;
	for (;q--;){
		read(op);
		if (op==1){
			read(v);
			rt=v;
		}
		else if (op==2){
			read(u),read(v),read(x);
			int f=LCA(u,v,rt);
			if (f==rt) update(1,1,n,1,n,x);
			else{
				if (contain(f,rt)){
					int la=LA(rt,dep[f]+1);
					update(1,1,n,1,n,x);
					update(1,1,n,L[la],R[la],-x);
				}
				else{
					update(1,1,n,L[f],R[f],x);
				}
			}
		}
		else{
			read(v);
			if (v==rt) printf("%lld\n",sum[1]);
			else{
				if (contain(v,rt)){
					int la=LA(rt,dep[v]+1);
					printf("%lld\n",sum[1]-query(1,1,n,L[la],R[la]));
				}
				else{
					printf("%lld\n",query(1,1,n,L[v],R[v]));
				}
			}
		}
	}
	return 0;
}
```', 'public', NULL, 'published', '["Segment Tree"]', '2018-07-31T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-917B', 'Codeforces 917B MADMAX', 'Codeforces 917B MADMAX', '**题目链接**：[http://codeforces.com/problemset/problem/917/B](http://codeforces.com/problemset/problem/917/B)

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
    while(ch<''0''||ch>''9'')_f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
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
        G[u].pb(make_pair(v,ch[0]-''a''));
    }
    memset(dp,-1,sizeof(dp));
    for (int i=1;i<=n;i++){
        for (int j=1;j<=n;j++){
            putchar(dfs(i,j,0)?''A'':''B'');
        }
        puts("");
    }
    return 0;
}

```', 'public', NULL, 'published', '["DP","Game Theory"]', '2018-01-30T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-920F', 'Codeforces 920F SUM and REPLACE', 'Codeforces 920F SUM and REPLACE', '**题目链接**：[http://codeforces.com/problemset/problem/920/F](http://codeforces.com/problemset/problem/920/F)

**题意**：给定序列支持两种操作，操作一：区间 $[L,R]$ 内所有数字替换成它们的约数个数，操作二:输出区间 $[L,R]$ 和。

**思路**：先用筛法把每个 $[1,1000000]$ 内所有数字的约数个数求出来，然后显然对于一个数最多经过 $6$ 次就变成 $2$ 或 $1$，所以我们建两棵线段树，一棵维护区间和，一棵维护区间最值，对于操作一我们线段树往下找的时候如果区间最值大于 $2$ 的话就往下搜，然后暴力更新，操作二就是常规的线段树求区间和。

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
#define mp make_pair
#define ALL(x) x.begin(),x.end()
#define F first
#define S second
using namespace std;
typedef long long ll;
const int maxn=1e6+5;
const int INF=0x3f3f3f3f;
const int P=1000000007;
const double PI=acos(-1.0);
template<typename T>
inline T read(T&x){
    x=0;int _f=0;char ch=getchar();
    while(ch<''0''||ch>''9'')_f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
    return x=_f?-x:x;
}
template <class T1, class T2>inline void gmax(T1 &a,T2 b){if (b>a) a=b;}
template <class T1, class T2>inline void gmin(T1 &a,T2 b){if (b<a) a=b;}
void up(int&x,int y){x+=y;if(x>=P)x-=P;}
const int N=300000+10;
int n,m,i,j,op,l,r,sz,v[N],D[maxn],mx[N<<2];
ll sum[N<<2];
#define umax(a,b) (a<b?b:a)
void gmax(int&a,int b){if(a<b)a=b;}
void pushup(int root){
    sum[root]=sum[root<<1]+sum[root<<1|1];
    mx[root]=umax(mx[root<<1],mx[root<<1|1]);
}
void build(int root,int l,int r){
    if (l==r){
        sum[root]=read(mx[root]);
        return;
    }
    int mid=l+((r-l)>>1);
    build(lson);
    build(rson);
    pushup(root);
}
void update(int root,int l,int r,int L,int R){
    if (L<=l && r<=R && mx[root]<=2) return;
    if (l==r){
        sum[root]=mx[root]=D[sum[root]];
        return;
    }
    int mid=l+((r-l)>>1);
    if (L<=mid) update(lson,L,R);
    if (mid<R) update(rson,L,R);
    pushup(root);
}
ll query_sum(int root,int l,int r,int L,int R){
    if (L<=l && r<=R) return sum[root];
    int mid=l+((r-l)>>1);
    ll res=0;
    if (L<=mid) res+=query_sum(lson,L,R);
    if (mid<R) res+=query_sum(rson,L,R);
    return res;
}
int main(){
    for (i=1;i<=1e6;i++){
        for (j=i;j<=1e6;j+=i){
            D[j]++;
        }
    }
    read(n),read(m);
    build(1,1,n);
    for (i=1;i<=m;i++){
        read(op),read(l),read(r);
        if (op==2) printf("%lld\n",query_sum(1,1,n,l,r));
        else if (mx[1]>2){
            update(1,1,n,l,r);
        }
    }
    return 0;
}
```', 'public', NULL, 'published', '["Segment Tree","Math"]', '2018-02-05T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-986C', 'Codeforces 916E Jamie and Tree', 'Codeforces 916E Jamie and Tree', '**题目链接**：[https://codeforces.com/contest/986/problem/C](https://codeforces.com/contest/986/problem/C)

**题意**：给你 $ m $ 个数字，每个数字两两可以连边的条件是 $ x\& y==0 $ ，求生成图的连通块数量。

**思路**：本质还是要优化建图，因为暴力连边肯定是不可取的。我们考虑新建 $ 2^n $ 个点分别为 $ [0,2^n-1] $ ，这样图中即有 $ m+2^n $ 个点，对于新建点的内部的连边我们这样做：对于数字 $ x $ 我们二进制展开去找为 $ 0 $ 的位，假设为 $ i $ ，那么我们就连一条 $ x $ -> $ x\oplus (2^i) $ 的边。然后对于序列中的点我们假设为 $ x $ ，那么 $ x $ 要向新建点权值为 $ x $ 的点连一条边，而对于新建的点，我们连一条 $ x->(2^n-1-x) $ 的出边，然后去跑 $ dfs $ 数连通块即可。这样的正确性说明： $ x\& y==0 $ 可以知道 $ y $ 按位取反以后的数里面的 $ 1 $ 的位数一定包含 $ x $ 中 $ 1 $ 的位数，所以对于 $ x $ 我们每次 $ dfs $ 进入新建的 $ 2^n $ 个点中的图以后相当与每次找一个为 $ 0 $ 的位数然后把这一位填上 $ 1 $ 继续 $ dfs $ 保证了他能找到所有 $ y $ 按位取反以后的点。然后对于这些点有因为连了一条出边到按位取反的点，所以我们即可找到一条从 $ x $ 到满足条件的 $ y $ 的路径，时间复杂度 $ O(n2^n) $ 。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=(1<<22)+10;
int n,m,i,mx,cnt,a[N];
bool vis[N][2],exist[N];
void dfs(int x,int tp){
	if (vis[x][tp]) return;
	vis[x][tp]=1;
	if (tp==0) dfs(x,1);
	else{
		for (int i=0;i<n;i++){
			if (!(x&(1<<i))) dfs(x^(1<<i),1);
		}
		if (exist[mx^x]) dfs(mx^x,0);
	}
}
int main(){
	read(n),read(m);
	for (mx=(1<<n)-1,i=1;i<=m;i++) read(a[i]),exist[a[i]]=1;
	for (i=1;i<=m;i++)if(!vis[a[i]][0]){
		cnt++;
		dfs(a[i],0);
	}
	printf("%d\n",cnt);
	return 0;
}
```', 'public', NULL, 'published', '["Graph Theory"]', '2018-06-01T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-997C', 'Codeforces 997C Sky Full of Stars', 'Codeforces 997C Sky Full of Stars', '**题目链接**:[http://codeforces.com/problemset/problem/997/C](http://codeforces.com/problemset/problem/997/C)

**题意**：给你一个 $n\times n$ 的空白矩阵，你要往里面染色，可以染的颜色只有三种，符合条件的染色方案是至少出现一行或一列的颜色都是一样的，问合法的方案一共有几种。

**思路**：考虑容斥定理枚举几行几列染的颜色一样我们可以列出该式子：

$$
\sum_{i=0}^{n}\sum_{j=0}^{n}\binom{n}{i}\binom{n}{j}(-1)^{i+j+1}f(i,j)(i+j>0)
$$

其中 $f(i,j)$ 表示枚举有 $i$ 行 $j$ 列的方案数。然后我们来考虑 $f(i,j)$，分析讨论可以知道，当 $i==0||j==0$ 的时候，$f(0,j)=3^j\times 3^{n(n-j)}$,含义就是枚举了 $j$ 列颜色一样，那么这 $j$ 列每列可选的颜色就是三个，即 $3^j$，剩下的各自颜色乱放，即 $3^{n(n-j)}$，然后乘起来即可，否则 $f(i,j)=3\times 3^{(n-i)(n-j)}$，因为这时候你要同时满足枚举的 $i$ 行 $j$ 列颜色都一样，而这行与列一定是有交点的，所以导致的结果就是他们的染色都是一样的，所以我们只有 $3$ 种颜色选择，这样 $f(i,j)$ 就讨论完了，我们也就可以得出一个 $O(n^2logn)$ 或 $O(n^2)$ 的解法，然而这肯定还是不能通过本题，需要对式子进行化简。

我们先 $O(n)$ 算出 $i=0||j=0$ 的情况，然后剩下的式子就变成

$$
\sum_{i=1}^{n}\sum_{j=1}^{n}\binom{n}{i}\binom{n}{j}(-1)^{i+j+1}3\times 3^{(n-i)(n-j)}
$$

我们用 $i$ 代换 $n-i$，$j$ 带换 $n-j$，则式子变成

$$
3\sum_{i=0}^{n-1}\sum_{j=0}^{n-1}\binom{n}{i}\binom{n}{j}(-1)^{i+j+1}\times 3^{ij}
$$

然后提出 $i$ 相关的系数，则式子变成

$$
3\sum_{i=0}^{n-1}\binom{n}{i}(-1)^{i+1}\sum_{j=0}^{n-1}\binom{n}{j}(-1)^j(3^i)^j
$$

对枚举 $j$ 的部分我们显然可以用二项式定理进行化简，得到

$$
3\sum_{i=0}^{n-1}\binom{n}{i}(-1)^{i+1}[(1+(-3^i))^n-(-3^i)^n]
$$

那么我们就可以在 $O(n)$ 或 $O(n\log n)$ 的时间通过此题了。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x; 
}
const int N=1000000+10;
const int P=998244353;
int ans,res,n,i,po[N],jc[N],inv[N];
int ksm(int a,ll n){
	int res=1;
	while (n){
		if (n&1) res=1LL*res*a%P;
		a=1LL*a*a%P;
		n>>=1LL;
	}
	return res;
}
int main(){
	read(n);
	for (jc[0]=po[0]=1,i=1;i<=n;i++){
		jc[i]=1LL*jc[i-1]*i%P;
		inv[i]=ksm(jc[i],P-2);
		po[i]=po[i-1]*3LL%P;
	}

	for (i=1;i<=n;i++){
		int c;
		if (i==n) c=1;
		else{
			c=1LL*jc[n]*inv[i]%P;
			c=1LL*c*inv[n-i]%P;
		}
		int d=1LL*ksm(3,i)*ksm(3,1LL*n*(n-i))%P;
		d=1LL*d*c%P;
		if ((i+1)&1) res-=2LL*d%P;
		else res+=2LL*d%P;
		res%=P;if (res<0) res+=P;
	}
	
	for (i=0;i<=n-1;i++){
		int c=1LL*jc[n]*inv[i]%P;
		c=1LL*c*inv[n-i]%P;
		if (i==0) c=1;

		int d=-po[i];
		d%=P;if (d<0) d+=P;
		
		int tmp=(1+d)%P;
		tmp=ksm(tmp,n)-ksm(d,n);
		tmp%=P;if (tmp<0) tmp+=P;

		tmp=1LL*tmp*c%P;
		if ((i+1)&1) ans-=tmp;
		else ans+=tmp;

		ans%=P;if (ans<0) ans+=P;	
	}
	ans=3LL*ans%P;
	ans=(ans+res)%P;
	printf("%d\n",ans);
	return 0;
}
```', 'public', NULL, 'published', '["Math"]', '2018-07-02T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-round603', 'Codeforces Round#603(Div. 2) E/F 题解', 'Codeforces Round#603(Div. 2) E/F 题解', '**比赛地址**：[https://codeforces.com/contest/1263](https://codeforces.com/contest/1263)

## E-Editor

**题意**：模拟打字，光标可以左移右移或者输入左括号右括号或者小写字母，现在给你操作序列，问每次操作完以后当前输入的字符串最深括号深度如果括号序列是合法的。

**思路**：用 $HDU4699$ 一样的思路去做就好了，维护前缀和，最大最小前缀和一共 $6$ 个栈，如果括号序列是合法的，最深的括号深度就是前缀和最大的那个，最小前缀和是为了判定是否合法的，因为出现负数就说明不合法，时间复杂度 $O(n)$。

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
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
        if (s[i]==''('') update(topA,1);
        else if (s[i]=='')'') update(topA,-1);
        else if (s[i]==''L''){
            if (topA>=2){
                b[++topB]=a[topA--];
                suf[topB]=suf[topB-1]+b[topB]*-1;
                f3[topB]=max(f3[topB-1],suf[topB]);
                f4[topB]=min(f4[topB-1],suf[topB]);
            }
        }
        else if (s[i]==''R''){
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
        printf("%d%c",ans,i==n?''\n'':'' '');
    }
    return 0;
}
```

## F-Economic Difficulties

**题意**: 一共 $n$ 个机器，上下有两棵以 $1$ 为根的树，叶子节点与机器相连，保证对于任意子树，它管辖的机器的编号是一个连续段，问最多可以删掉多少条边，使得每个机器最少跟一棵树的根节点相连。

**思路**：重要性质是对于任意子树，它管辖的机器的编号是一个连续段，所以我们可以直接 $dp$，定义 $dp[i]$ 为前 $i$ 的节点都能跟根节点相连最多可以删的边数，转移方程就是$dp[i]=max(dp[j]+max(upcost(j+1,i),downcost(j+1,i)))$，$cost(l,r)$ 定义的是编号 $[l,r]$ 不与根节点相连最多可以删掉多少条边，对于 $cost$ 的话因为有那个性质，所以每个节点管辖的区间可以最多删除节点为根的子树大小条边，这样也不会影响到其他编号的节点，一棵树里删了另一个树没删就行，所以取 $max$，时间复杂度 $O(n^2)$。

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
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
```', 'public', NULL, 'published', '["DP","Stack"]', '2019-12-01T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeforces-round605', 'Codeforces Round#605(Div. 3) D/E/F 题解', 'Codeforces Round#605(Div. 3) D/E/F 题解', '- 比赛地址：[https://codeforces.com/contest/1272](https://codeforces.com/contest/1272)

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
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
    for (i=1;i<=n;++i) printf("%d%c",ans[i],i==n?''\n'':'' '');
    return 0;
}
```

---

## F - Two Bracket Sequences

**题意**：给两个括号序列 $S$ 和 $T$，构造最短的合法括号序列使得其中包含 $S$ 和 $T$ 两个子序列。

**思路**：定义 $f[i][j][k]$ 为匹配 $S$ 前 $i$ 个字符，$T$ 前 $j$ 个字符，当前构造的括号序列 $balance$ 为 $k$ 的最短长度，转移就是枚举添加的是 $''(''$还是$'')''$，顺便记录一下转移的位置然后还原即可，时间复杂度 $O(n^3)$。

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
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
                int nxi=i+(i+1<=ls && s[i+1]==''('');
                int nxj=j+(j+1<=lt && t[j+1]==''('');
                if (k+1<2*N && dp[nxi][nxj][k+1]>dp[i][j][k]+1){
                    dp[nxi][nxj][k+1]=dp[i][j][k]+1;
                    p[nxi][nxj][k+1]=(State){i,j,k,''(''};
                }
 
                nxi=i+(i+1<=ls && s[i+1]=='')'');
                nxj=j+(j+1<=lt && t[j+1]=='')'');
                if (k>0 && dp[nxi][nxj][k-1]>dp[i][j][k]+1){
                    dp[nxi][nxj][k-1]=dp[i][j][k]+1;
                    p[nxi][nxj][k-1]=(State){i,j,k,'')''};
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
    string res=string(pos,'')'');
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
```', 'public', NULL, 'published', '["DP","BFS","Constructive Algorithm"]', '2019-12-14T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('codeplus-2018-4', '「CodePlus 2018 4 月赛」最短路', '「CodePlus 2018 4 月赛」最短路', '**题目链接**：[https://loj.ac/problem/6354](https://loj.ac/problem/6354)

**题意**：略。

**思路**：暴力连边 $n^2$ 直接炸了，不可取，考虑优化连边。由异或联想到二进制，注意到 $10101->10000$ 完全可以由 $10101->10001->10000$ 得到，也就是说 $10101->10000$ 这条边是完全没有必要的，也即我们只要每次枚举 $x$ 的二进制位 $i$，若 $i$ 这一位为 $1$ 则由 $x$ 向$x\oplus 2^i$ 连一条边权为 $2^i\times c$ 的双向边，那么 $x$ 到其他任意值的边权我们都可以通过这样的拆分得到了，然后跑下最短路就可以了，时间复杂度 $O((m+n\log n)\log n)$。

```cpp
#include <bits/stdc++.h>
#define PB push_back
#define MP make_pair
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int maxn=1e5+10;
const int INF=2000000000;
int n,m,i,j,c,u,v,w,s,t;
struct Edge{
    int from,to,dist;
};
struct HeapNode{
    int d,u;
    bool operator <(const HeapNode& rhs)const{
        return d>rhs.d;
    }
};
struct Dijkstra{
    int n,m;
    vector<Edge>edges;
    vector<int>G[maxn];
    bool done[maxn];
    int d[maxn];
    int p[maxn];

    void init(int n){
        this->n=n;
        for (int i=0;i<=n;i++) G[i].clear();
        edges.clear();
    }

    void AddEdge(int from,int to,int dist){
        edges.push_back((Edge){from,to,dist});
        m=edges.size();
        G[from].push_back(m-1);
    }

    void dijkstra(int s){
        priority_queue<HeapNode>Q;
        for (int i=0;i<=n;i++) d[i]=INF;
        d[s]=0;
        memset(done,false,sizeof(done));
        Q.push((HeapNode){0,s});
        while (!Q.empty()){
            HeapNode x=Q.top();Q.pop();
            int u=x.u;
            if (done[u]) continue;
            done[u]=true;
            for (int i=0;i<(int)G[u].size();i++){
                Edge &e=edges[G[u][i]];
                if (d[e.to]>d[u]+e.dist){
                    d[e.to]=d[u]+e.dist;
                    p[e.to]=G[u][i];
                    Q.push((HeapNode){d[e.to],e.to});
                }
            }
        }
    }
}solver;
int main(){
	read(n),read(m),read(c);
	solver.init(n);
	for (i=1;i<=m;i++){
		read(u),read(v),read(w);
		solver.AddEdge(u,v,w);
	}
	for (i=1;i<=n;i++){
		for (j=17;j>=0;j--){
			if (i&(1<<j)){
				solver.AddEdge(i,i^(1<<j),(1<<j)*c);
				solver.AddEdge(i^(1<<j),i,(1<<j)*c);
			}
		}
	}
	read(s),read(t);
	solver.dijkstra(s);
	printf("%d\n",solver.d[t]);
	return 0;
}
```', 'public', NULL, 'published', '["Shortest Path"]', '2018-05-25T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('csr-55', 'CSAcademy Round#55 Black White Tree', 'CSAcademy Round#55 Black White Tree', '**题目链接**：[https://csacademy.com/contest/round-55/task/black-white-tree/](https://csacademy.com/contest/round-55/task/black-white-tree/)

**题意**：给定一棵树，对节点进行黑白染色，然后给出两个操作，操作 $1$ 是将指定节点的颜色取反，黑的染成白的，白的染成黑的，操作 $2$ 是查询整棵树中所有与该节点相同颜色的距离之和。

**思路**：其实自己还是云里雾里的，对于这题的分块还是不太懂复杂度怎么算的。。不过还是有所收获，对树形 $DP$ 的一个套路又加深了印象，抛开两个操作，直接求每个节点与其他所有节点的距离和 $ans_i$ 要用到树形 $DP$，$DFS$ 以任意节点为根节点搜一下求出以每个节点为根节点的子树里节点到该节点的路径和 $sum_i$ 及节点数量 $cnt_i$，那么对于根节点的其他所有节点到该节点的距离和无疑就是 $sum_r$，然后对于它的相邻节点，我们可以很容易通过现有的东西 $O(1)$ 推算出相邻节点的值。$O(n)$ 的复杂度即可求出答案，那么回到这个问题，无疑就是记录以这个节点为根的黑色节点数量和白色节点数量，还有它们到根节点的距离和即可求出我们要的答案。接下来就是玄学部分了...自己也不是很懂，大概就是 $sqrt(Q)$ 为一个整体做一次树形 $DP$，然后里面乱搞...复杂度也不会算...太菜了...以后再回来回顾吧...

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
using namespace std;
typedef long long ll;
const int magic=210;
const int maxn=50000+5;
const int INF=0x3f3f3f3f;
const int P=1000000007;
const double PI=acos(-1.0);
template<typename T>
inline T read(T&x){
    x=0;int _f=0;char ch=getchar();
    while(ch<''0''||ch>''9'')_f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
    return x=_f?-x:x;
}
int n,m;
set<int>q;
int d[maxn],col[maxn],parent[maxn][17],cnt[maxn][2],sum[maxn][2];
vector<int>G[maxn];
void dfs(int u,int f){
    parent[u][0]=f;
    for (int i=1;(1<<i)<=d[u];i++) parent[u][i]=parent[parent[u][i-1]][i-1];
    for (auto v:G[u]){
        if (v==f) continue;
        d[v]=d[u]+1;
        parent[v][0]=u;
        dfs(v,u);
    }
}
int lca(int u,int v){
    if (d[u]>d[v]) swap(u,v);
    for (int k=0;k<17;k++){
        if (((d[v]-d[u])>>k)&1) v=parent[v][k];
    }
    if (u==v) return u;
    for (int k=16;k>=0;k--){
        if (parent[u][k]!=parent[v][k]){
            u=parent[u][k];
            v=parent[v][k];
        }
    }
    return parent[u][0];
}
int dist(int x,int y){return d[x]+d[y]-2*d[lca(x,y)];}
void dfs1(int u,int f){
	for(auto &v:G[u]){
		if(v==f)continue;
		dfs1(v,u);
		cnt[u][0]+=cnt[v][0];
		cnt[u][1]+=cnt[v][1];
		sum[u][0]+=sum[v][0]+cnt[v][0];
		sum[u][1]+=sum[v][1]+cnt[v][1];
	}
	cnt[u][col[u]]++;
}
void dfs2(int u,int f){
    if (u!=1){
        int cnty0=cnt[f][0]-cnt[u][0];
        int cnty1=cnt[f][1]-cnt[u][1];
        int sumy0=sum[f][0]-(sum[u][0]+cnt[u][0]);
        int sumy1=sum[f][1]-(sum[u][1]+cnt[u][1]);
        cnt[u][0]+=cnty0;
        cnt[u][1]+=cnty1;
        sum[u][0]+=sumy0+cnty0;
        sum[u][1]+=sumy1+cnty1;
    }
    for(auto v:G[u]){
        if (v==f) continue;
        dfs2(v,u);
    }
}
void build(){
    memset(cnt,0,sizeof(cnt));
    memset(sum,0,sizeof(sum));
    dfs1(1,1);
    dfs2(1,1);
}
int main(){
    read(n),read(m);
    for (int i=1;i<=n;i++) read(col[i]);
    for (int i=1;i<n;i++){
        int u,v;read(u),read(v);
        G[u].push_back(v);
        G[v].push_back(u);
    }
    dfs(1,1);
    build();
    for(;m--;){
        int t,x;
        read(t),read(x);
        if (t==1){
            if (q.count(x)) q.erase(x);
            else q.insert(x);
            if (q.size()>=magic){
                for (auto& itr:q){
                    col[itr]=!col[itr];
                }
                build();
                q.clear();
            }
        }
        else{
            int colx=col[x];
            if (q.count(x)) colx=!col[x];
            int res=sum[x][colx];
            for (auto& itr:q){
                if (colx==!col[itr]) res+=dist(x,itr);
                else res-=dist(x,itr);
            }
            printf("%d\n",res);
        }
    }
    return 0;
}
```', 'public', NULL, 'published', '["DP"]', '2017-11-02T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('del-bracket', '删括号', '删括号', '**题目链接**：[https://ac.nowcoder.com/acm/problem/21303](https://ac.nowcoder.com/acm/problem/21303)

**题意**：略。

**思路**：删括号的时候一定要时刻保证左括号数量比右括号多，我们可以定义$dp[i][j][k]$表示考虑$A$前$i$个匹配了$B$前$j$个$A$被删除部分左括号数-右括号数=$k$是否可行，分类讨论转移即可，最后答案就是$dp[n][m][0]$。

```cpp
#include <cstdio>
#include <cstring>
const int N=105;
int n,m,i,j,k;
char a[N],b[N];
bool f[N][N][N];
int main(){
    scanf("%s%s",a+1,b+1);
    n=strlen(a+1),m=strlen(b+1);
    f[0][0][0]=1;
    for(i=0;i<n;++i)for(j=0;j<=m;++j)for(k=0;k<=n;++k)if(f[i][j][k]){
        if (!k && a[i+1]==b[j+1]) f[i+1][j+1][k]=1;
        if (a[i+1]==''('') f[i+1][j][k+1]=1;
        else if (k) f[i+1][j][k-1]=1;
    }
    puts(f[n][m][0]?"Possible":"Impossible");
    return 0;
}
```', 'public', NULL, 'published', '["DP"]', '2019-02-02T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('document-style', '文档书写要点整理', '记录一些规范写文档的要点', '## 前言

最近在兼职 leetcode 的写题解职务，然而今天交上去以后，被别的审稿人挑了非常多的错误= =，查了一下审稿的是个 THU 的大佬（星星眼），所以记录一下，以后写完题解都 check 一下，努力完善自己写的文档。

## 通用部分

阅读[中文文案排版指北](https://mazhuang.org/wiki/chinese-copywriting-guidelines/)

markdown 中段落与段落间要空行保持美观

减少口语化表达，注意断句

所有较复杂的公式（例如较长、带上下标）独占一行



## Latex部分

Latex 环境中如果出现长名字的变量，用 `\textit{}` 包裹会更美观

对于 `log` 需要用 `\log` 来表达

行间代码不要使用 Latex 环境

右箭头用 `\rightarrow` 来代替 `->` 



## 题解部分

尽量不要出现一些语言特定的保留字，比如 $\textit{NULL}$ ，要考虑到受众
可能不会你这种语言，一般来说需要用口头语言表达这种情况即可

规范代码格式

时间复杂度分析：在不分析平均时间复杂度的前提下，不需要分析最优的时间复杂度

空间复杂度分析：只计算额外空间复杂度，存储答案的空间不需要计入', 'public', NULL, 'published', '[]', '2020-03-01T15:52:39.707Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('fzu-2277', 'FZUOJ 2277 Change', 'FZUOJ 2277 Change', '**题目链接**：[http://acm.fzu.edu.cn/problem.php?pid=2277](http://acm.fzu.edu.cn/problem.php?pid=2277)

**题意**：给你一棵以 $1$ 为根的树，树上每个初始节点为 $0$，然后有两种操作：1.1 v x k 表示给 $v$ 节点加 $x$ 给 $v$ 节点的孩子加 $x-k$ 给 $v$ 节点孩子的孩子加 $x-2*k$，一直到叶子节点；2.2 v 表示查询当前 $v$ 的权值。

**思路**：操作1可以转化为 $[x+dep[u]\times k-dep[v]\times k]$其中 $v$ 为 $u$ 的子节点，那么我们可以先树链剖分，然后用一个树状数组维护 $x+dep[u]\times k$ 的值，再用另一个树状数组维护 $\sum k$的值就可以了，查询的时候相当于从 $v$ 走到根节点所有的值相加。

```cpp
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
using namespace std;
typedef long long ll;
const int maxn=3e5+10;
const int INF=0x3f3f3f3f;
const int MOD=1000000007;
const double PI=acos(-1.0);
template<typename T>
inline T read(T&x){
    x=0;int _f=0;char ch=getchar();
    while(ch<''0''||ch>''9'')_f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
    return x=_f?-x:x;
}
int T;
int n,m,q,dfs_clock;
int son[maxn],id[maxn],fa[maxn],bel[maxn],dep[maxn],sz[maxn];
ll sum[maxn][2];
vector<int>G[maxn];
void init(){
    dfs_clock=0;
    for (int i=1;i<=n;i++) G[i].clear();
    memset(sum,0,sizeof(sum));
}
void dfs1(int u,int f){
    dep[u]=(f==-1?1:dep[f]+1);
    fa[u]=f;
    sz[u]=1;
    son[u]=-1;
    for (int i=0;i<(int)G[u].size();i++){
        int v=G[u][i];
        if (v==f) continue;
        dfs1(v,u);
        sz[u]+=sz[v];
        if (son[u]==-1 || sz[v]>sz[son[u]]){
            son[u]=v;
        }
    }
}
void dfs2(int u,int f){
    bel[u]=f;
    id[u]=++dfs_clock;
    if (son[u]==-1) return;
    dfs2(son[u],f);
    for (int i=0;i<(int)G[u].size();i++){
        int v=G[u][i];
        if (v==fa[u] || v==son[u]) continue;
        dfs2(v,v);
    }
}
int lowbit(int x){return x&(-x);}
void add(int x,int v,int k){
    while (x<=n){
        sum[x][k]+=v;
        sum[x][k]%=MOD;
        x+=lowbit(x);
    }
}
ll getSum(int x,int k){
    ll ret=0;
    while (x){
        ret+=sum[x][k];
        x-=lowbit(x);
    }
    return ret%MOD;
}
void solve(int v){
    int t=dep[v];
    ll sum1=0,sum2=0;
    while (bel[v]!=1){
        sum1=(sum1+getSum(id[v],0)-getSum(id[bel[v]]-1,0)+MOD)%MOD;
        sum2=(sum2+getSum(id[v],1)-getSum(id[bel[v]]-1,1)+MOD)%MOD;
        v=fa[bel[v]];
    }
    sum1=(sum1+getSum(id[v],0)-getSum(id[bel[v]]-1,0)+MOD)%MOD;
    sum2=(sum2+getSum(id[v],1)-getSum(id[bel[v]]-1,1)+MOD)%MOD;
    sum1=(sum1*t)%MOD;
    sum2-=sum1;
    sum2=(sum2%MOD+MOD)%MOD;
    printf("%I64d\n",sum2);
    return;
}
int main(){
    for (read(T);T;T--){
        read(n);
        init();
        for (int i=2;i<=n;i++){
            int p;read(p);
            G[i].push_back(p);
            G[p].push_back(i);
        }
        dfs1(1,-1);
        dfs2(1,1);
        read(q);
        for (int i=1;i<=q;i++){
            int op,v,x,k;
            read(op);
            if (op==1){
                read(v),read(x),read(k);
                add(id[v],k,0);
                add(id[v],(x+(ll)k*dep[v]%MOD)%MOD,1);
            }
            else{
                read(v);
                solve(v);
            }
        }
    }
    return 0;
}
```', 'public', NULL, 'published', '["Segment Tree"]', '2017-07-23T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('hdu-19th-cp-report', '杭州电子科技大学第十九届程序设计竞赛 解题报告', '必备信息搜索技能', '## 一些记录
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
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
                if ((s[i]==''O'' && s2[i]==''0'')||(s2[i]==''O'' && s[i]==''0'')||((s[i]==''l'' && s2[i]==''I'')||(s[i]==''I'' && s2[i]==''l''))) continue;
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
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
            if (s[0]==''?''){
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
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
            if (s[0]==''G'') c^=x;
            else if (s[0]==''R'') a+=x;
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
- 题意：一个数字串是''''质数串''''，当且仅当它的每个非空连续子串表示的数字都是质数。给定一个长度为$n(n\le 100000)$的数字串S，请统计它有多少个非空连续子串是质数串。注意两个子串如果位置不同也算不同，比如$"373373"$中，$"373"$要算入答案两次。
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
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
                if (s[j]==''1'' || s[j]==''4'' || s[j]==''6'' || s[j]==''8'' || s[j]==''9'') break;
                if (j>i && s[j]==s[j-1]) break;
                res=res*10+s[j]-''0'';
                if (isPrime(res)) ans++;
                else break;
            }
        }
        printf("%lld\n",ans);
    }
    return 0;
}
```', 'public', NULL, 'published', '["Binary Search","DP","BFS","Game Theory"]', '2019-04-02T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('hdu-2457', 'Codeforces 444C DZY Loves Colors', 'Codeforces 444C DZY Loves Colors', '**题目链接**：[http://acm.hdu.edu.cn/showproblem.php?pid=2457](http://acm.hdu.edu.cn/showproblem.php?pid=2457)

**题意**：给你若干个模式串，再给你一个文本串，问你最少替换掉多少个字符能使得文本串里不含这些模式串。

**思路**：对于给定的模式串建立好 Trie 图后，进行 dp。设 dp[i][j] 为走到 i 节点且已经走了 j 长度的文本串的时候与文本串前 j 个不同的有 x 个，则可以列出状态转移方程 dp[i][j]=dp[k][j-1]+v，其中 k 是可以走到 i 的节点，当 s[i] 与当前结点所代表的字符相同的时候 v 为 0 否则为 1。初始边界：dp[i][j]=-1 except dp[0][0]=0。

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
using namespace std;
typedef long long ll;
const int maxn=500000+5;
const int INF=0x3f3f3f3f;
const int P=1000000007;
const double PI=acos(-1.0);
template<typename T>
inline T read(T&x){
    x=0;int _f=0;char ch=getchar();
    while(ch<''0''||ch>''9'')_f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
    return x=_f?-x:x;
}
inline int add(int a,int b){return (a+=b)>=P?a-P:a;}
inline int sub(int a,int b){return (a-=b)<0?a+P:a;}
inline int mul(int a,int b){return 1LL*a*b%P;}
int T,n,V,dp[5000],val[2100];
int main(){
    for (scanf("%d",&T);T--;){
       scanf("%d",&n);
       for (int i=1;i<n;i++) scanf("%d",val+i);
       memset(dp,-1,sizeof(dp));
       dp[0]=n*val[1];
       for (int i=2;i<n;i++) val[i]-=val[1];
       V=n-2;
       for (int i=2;i<n;i++){
            for (int j=i-1;j<=V;j++)if(dp[j-i+1]!=-1){
                if (dp[j]!=-1) dp[j]=max(dp[j],dp[j-i+1]+val[i]);
                else dp[j]=dp[j-i+1]+val[i];
            }
       }
       printf("%d\n",dp[V]);
    }
    return 0;
}
```', 'public', NULL, 'published', '["Sqrt Algorithm"]', '2018-03-04T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('hdu-5534', 'HDUOJ 5534 Partial Tree', 'HDUOJ 5534 Partial Tree', '**题目链接**：[http://codeforces.com/problemset/problem/1149/B](http://codeforces.com/problemset/problem/1149/B)

**题意**：有 $n$ 个点要给他们连边组成一棵树，然后给你一个函数 $f(d)$ 表示度数为 $d$ 的点的价值，然后我们要求价值之和的最大值。

**思路**：首先观察发现一颗树如果节点为 $n$ 那么它的总度数一定为 $2*n-2$，然后问题就转化成了一个二维的完全背包问题，容量为总度数，物品重量代表度数，还要求恰好用 $n$ 个物品去填满，因为每个点度数至少要为 $1$ ，但这样复杂度是不能接受的，所以我们可以先假设每个点的度数为 $1$，算出当前价值，然后总度数就为 $n-2$，接下来就没有“恰好用 $n$ 个物品去填满”这个限制条件了，直接任意数量都可以，往 $n$ 个点的度数上加就可以了，这样就降了一维，直接完全背包去做就好了，但这里要注意就是价值要全部减去 $val[1]$ 表差值，而且每个物品的重量即度数也要相应减 $1$。

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
using namespace std;
typedef long long ll;
const int maxn=500000+5;
const int INF=0x3f3f3f3f;
const int P=1000000007;
const double PI=acos(-1.0);
template<typename T>
inline T read(T&x){
    x=0;int _f=0;char ch=getchar();
    while(ch<''0''||ch>''9'')_f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
    return x=_f?-x:x;
}
inline int add(int a,int b){return (a+=b)>=P?a-P:a;}
inline int sub(int a,int b){return (a-=b)<0?a+P:a;}
inline int mul(int a,int b){return 1LL*a*b%P;}
int T,n,V,dp[5000],val[2100];
int main(){
    for (scanf("%d",&T);T--;){
       scanf("%d",&n);
       for (int i=1;i<n;i++) scanf("%d",val+i);
       memset(dp,-1,sizeof(dp));
       dp[0]=n*val[1];
       for (int i=2;i<n;i++) val[i]-=val[1];
       V=n-2;
       for (int i=2;i<n;i++){
            for (int j=i-1;j<=V;j++)if(dp[j-i+1]!=-1){
                if (dp[j]!=-1) dp[j]=max(dp[j],dp[j-i+1]+val[i]);
                else dp[j]=dp[j-i+1]+val[i];
            }
       }
       printf("%d\n",dp[V]);
    }
    return 0;
}
```', 'public', NULL, 'published', '["DP"]', '2017-09-12T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('hdu-5629', 'HDUOJ 5629 Clarke and tree', 'HDUOJ 5629 Clarke and tree', '**题目链接**：[http://acm.hdu.edu.cn/showproblem.php?pid=5629](http://acm.hdu.edu.cn/showproblem.php?pid=5629)

**题意**：给定 $n$ 个节点还有每个节点最多的度数，问分别组成 $[1,n]$ 个节点的生成树的个数。

**思路**：结合 $prufer$ 序列可列出一个 $dp$ 方程，即 $dp[i][j][k]$ 表示前 $i$ 个点用了 $j$ 个且总度数为 $k$ 的方案数，那么答案就是 $dp[n][i][i-2]$，转移方程：$i$ 不选时 $dp[i][j][k]+=dp[i-1][j][k]$，$i$ 选时，枚举 $i$ 的度数 $d$ 则 $dp[i][j+1][k+d]+=\binom{k+d}{d}dp[i-1][j][k]$，时间复杂度 $O(n^4)$。

```cpp
#include <bits/stdc++.h>
using namespace std;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=50+2;
const int P=1000000007;
int T,i,j,k,l,n,a[N],f[N][N][N],C[N][N];
void up(int&a,int b){a+=b;if(a>=P)a-=P;}
void init(){
	for (int i=0;i<=50;i++){
		C[i][0]=1;
		for (int j=1;j<=i;j++){
			C[i][j]=C[i-1][j]+C[i-1][j-1];
			if (C[i][j]>=P) C[i][j]-=P;
		}
	}
}
int main(){
	init();
	for (read(T);T--;){
		read(n);
		for (i=1;i<=n;i++) read(a[i]);
		memset(f,0,sizeof(f));
		f[0][0][0]=1;
		for (i=1;i<=n;i++){
			for (j=0;j<i;j++){
				for (k=0;k<=n-2;k++){
					up(f[i][j][k],f[i-1][j][k]);
					for (l=0;l<a[i]&&k+l<=n-2;l++){
						up(f[i][j+1][k+l],1LL*C[k+l][l]*f[i-1][j][k]%P);
					}
				}
			}
		}
		printf("%d ",n);
		for (i=2;i<=n;i++) printf("%d%c",f[n][i][i-2],i==n?''\n'':'' '');
	}
	return 0;
}
```', 'public', NULL, 'published', '["DP","Math"]', '2018-05-08T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('hdu-5977', 'HDUOJ 5977 Garden of Eden', 'HDUOJ 5977 Garden of Eden', '**题目链接**：[http://acm.hdu.edu.cn/showproblem.php?pid=5977](http://acm.hdu.edu.cn/showproblem.php?pid=5977)

**题意**：给你一棵树，每个节点有一个类型值，要求你统计树上满足条件的两两点对 $(u,v)$, $u$ 到 $v$ 的路径上经过了所有的类型值。

**思路**：考虑点分治，因为类型值很少，所以可以状压，那么如何统计满足条件的点对呢？考虑一个点到当前重心的得到类型值为 $x$，那么满足条件的点到当前重心得到的类型值 $y$ 满足 $x|y=2^k-1$，即 $x$ 按位取反后的所有超集都是满足条件的，所以每次点分治的时候先 $dfs$ 一遍得到所有点到根节点的得到的类型值，然后高维前缀和求超集和，再枚举每个状态去统计答案即可。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=50000+10;
const int M=1024+10;
const int INF=2000000000;
int n,k,i,u,v,root,sum,tp[N],sz[N],f[N],cnt[M],num[M];
ll ans;
bool vis[N];
vector<int>G[N];
void getroot(int u,int p){
    sz[u]=1,f[u]=0;
    for (int i=0;i<(int)G[u].size();++i){
        int v=G[u][i];
        if (v==p || vis[v]) continue;
        getroot(v,u);
        sz[u]+=sz[v];
        f[u]=max(f[u],sz[v]);
    }
    f[u]=max(f[u],sum-sz[u]);
    if (f[u]<f[root]) root=u;
}
void getdeep(int u,int p,int now){
    now|=(1<<tp[u]);
    ++cnt[now],++num[now];
    for (int i=0;i<(int)G[u].size();++i){
        int v=G[u][i];
        if (v==p || vis[v]) continue;
        getdeep(v,u,now);
    }    
}
ll cal(int u,int now){
    for (int status=0;status<(1<<k);++status) num[status]=cnt[status]=0;
    getdeep(u,0,now);
    for (int i=0;i<k;++i){
        for (int status=0;status<(1<<k);++status){
            if (!(status&(1<<i))) cnt[status]+=cnt[status|(1<<i)];
        }
    }
    ll res=0,det=0;
    for (int status=0;status<(1<<k);++status){
    	int complement=((1<<k)-1)^status;
    	res+=1LL*num[status]*cnt[complement];
    }
    return res;
}
void solve(int u){
    ans+=cal(u,0);
    vis[u]=1;
    for (int i=0;i<(int)G[u].size();++i){
        int v=G[u][i];
        if (vis[v]) continue;
        ans-=cal(v,(1<<tp[u]));
        sum=sz[v],root=0;
        getroot(v,root);
        solve(root);
    }
}
int main(){
    while (~scanf("%d%d",&n,&k)){
        for (i=1;i<=n;++i){
            read(tp[i]),--tp[i];
            G[i].clear(),vis[i]=0;
        }
        for (i=1;i<n;++i){
            read(u),read(v);
            G[u].PB(v);
            G[v].PB(u);
        }
        root=0,sum=n,f[0]=INF;
        getroot(1,0);
        ans=0,solve(root);
        printf("%lld\n",ans);
    }    
    return 0;
}
```', 'public', NULL, 'published', '["Divide and Conquer","DP"]', '2018-09-14T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('hdu-5988', 'HDUOJ 5988 Coding Contest', 'HDUOJ 5988 Coding Contest', '**题目链接**：[http://acm.hdu.edu.cn/showproblem.php?pid=5988](http://acm.hdu.edu.cn/showproblem.php?pid=5988)

**题意**：给你 $n$ 个点，$m$ 条边，每个点有指定的人和食物的数量。每条边第一次经过不会触碰到电线，从第二次开始，每经过一次都有 $p$ 的概率碰到，这条边最大允许通过人数是 $c$，求如何让每个同学都取到食物而且碰到电线的概率最小。

**思路**：补集思维，求碰到电线概率最小即 $1-$ 不碰到电线概率最大。不碰到电线的概率就是每条边上概率相乘，取个对数就可以转成加法了，然后考虑最小费用最大流建图：设立超级源点 $s$ 和超级汇点 $t$，如果该点人数大于食物数，那么源点向这个点连一条容量为人数和食物数之差，费用系数为 $0$ 的边，否则这个点向汇点连一条人数和食物数之差，费用系数为 $0$ 的边，然后对于给定的边按条件连就好了，注意要把容量为 $1$ 的单独拉出来连边，因为第一次走过不会触碰到电线，然后跑下最小费用最大流，再把答案还原回来即可。有个坑是 $SPFA$ 里面浮点数比较的时候要带上 $eps$，不然会 $TLE$。

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
using namespace std;
typedef long long ll;
const int maxn=10000+5;
const int INF=1e9;
const double eps=1e-8;
const int P=1000000007;
const double PI=acos(-1.0);
template<typename T>
inline T read(T&x){
    x=0;int _f=0;char ch=getchar();
    while(ch<''0''||ch>''9'')_f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
    return x=_f?-x:x;
}
struct Edge{
    int from,to,cap,flow;
    double cost;
    Edge(){}
    Edge(int f,int t,int c,int fl,double co):from(f),to(t),cap(c),flow(fl),cost(co){}
};
struct MCMF{
    int n,m,s,t,k;
    vector<Edge> edges;
    vector<int> G[maxn];
    bool inq[maxn];
    double d[maxn];
    int p[maxn];
    int a[maxn];

    void init(int n,int s,int t){
        this->n=n, this->s=s, this->t=t;
        edges.clear();
        for(int i=0;i<=n;++i) G[i].clear();
    }

    void AddEdge(int from,int to,int cap,double cost){
        edges.push_back(Edge(from,to,cap,0,cost));
        edges.push_back(Edge(to,from,0,0,-cost));
        m=edges.size();
        G[from].push_back(m-2);
        G[to].push_back(m-1);
    }

    bool SPFA(int &flow,double &cost){
        for(int i=0;i<n;++i) d[i]=INF;
        queue<int> Q;
        memset(inq,0,sizeof(inq));
        d[s]=0, Q.push(s), a[s]=INF, p[s]=0, inq[s]=true;
        while(!Q.empty()){
            int u=Q.front(); Q.pop();
            inq[u]=false;
            for(int i=0;i<G[u].size();++i){
                Edge &e=edges[G[u][i]];
                if(e.cap>e.flow && d[e.to]>d[u]+e.cost+eps){
                    d[e.to]=d[u]+e.cost;
                    p[e.to]=G[u][i];
                    a[e.to]=min(a[u],e.cap-e.flow);
                    if(!inq[e.to]){ Q.push(e.to); inq[e.to]=true; }
                }
            }
        }
        if(d[t]==INF) return false;
        flow+=a[t];
        int u=t;
        while(u!=s){
            edges[p[u]].flow+=a[t];
            edges[p[u]^1].flow-=a[t];
            cost+=a[t]*edges[p[u]].cost;
            u=edges[p[u]].from;
        }
        return true;
    }

    double solve(){
        int flow=0;
        double cost=0;
        while(SPFA(flow,cost));
        return cost;
    }
}MM;
int T,n,m,s,b,u,v,f;
double p;
int main(){
    for(scanf("%d",&T);T--;){
        scanf("%d%d",&n,&m);
        MM.init(n+2,0,n+1);
        for(int i=1;i<=n;i++){
            scanf("%d%d",&s,&b);
            int c=s-b;
            if(c>0) MM.AddEdge(0,i,c,0);
            else if(c<0) MM.AddEdge(i,n+1,-c,0);
        }
        for(int i=0;i<m;i++){
            scanf("%d%d%d%lf",&u,&v,&f,&p);
            p=-log(1.0-p);
            if(f>0) MM.AddEdge(u,v,1,0.0);
            if(f-1>0) MM.AddEdge(u,v,f-1,p);
        }
        double ans=MM.solve();
        ans=exp(-ans);
        printf("%.2f\n",1.0-ans);
    }
    return 0;
}
```', 'public', NULL, 'published', '["Network Flow"]', '2017-11-03T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('hdu-6148', 'HDUOJ 6148 Valley Numer', 'HDUOJ 6148 Valley Numer', '**题目链接**：[http://acm.hdu.edu.cn/showproblem.php?pid=6148](http://acm.hdu.edu.cn/showproblem.php?pid=6148)

**题意**：略。

**思路**：数位 $DP$，定义状态 $dp[pos][pre][up][preZero]$ 为 $pos$ 位置前一位数字为 $pre$,当前走势为 $up$ 前面是否都是前导 $0$ 的情况为 $preZero$ 的方案数，根据题目条件是不允许出现先增后减的情况，其他条件都允许，我们就按这个记忆化搜索下去就好了，注意还要排除前导零的情况。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=105;
const int P=1e9+7;
int T,dp[105][10][2][2];
char s[N];
inline void add(int&a,int b){a+=b;if(a>=P)a-=P;}
int dfs(int len,int num,bool up,bool preZero,bool jud){
	if (len==-1) return 1;
	if (!jud && ~dp[len][num][up][preZero]) return dp[len][num][up][preZero];
	int limit=jud?s[len]-''0'':9,ret=0;
	for (int i=0;i<=limit;++i){
		if (preZero) add(ret,dfs(len-1,i,0,preZero && i==0,jud && i==limit));
		else if(up && i>=num) add(ret,dfs(len-1,i,up,preZero && i==0,jud && i==limit));
		else if (!up) add(ret,dfs(len-1,i,i>num,preZero && i==0,jud && i==limit));
	}
	if (!jud) dp[len][num][up][preZero]=ret;
	return ret;
}
int main(){
	for (read(T);T--;){
		scanf("%s",s);
		int len=strlen(s);
		reverse(s,s+len);
		memset(dp,-1,sizeof(dp));
		int ans=dfs(len-1,0,0,1,1);
		add(ans,P-1);
		printf("%d\n",ans);
	}
	return 0;
}
```', 'public', NULL, 'published', '["DP"]', '2017-08-18T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('hdu-6191', 'HDUOJ 6191 对称数', 'HDUOJ 6191 对称数', '**题目链接**：[http://acm.hdu.edu.cn/showproblem.php?pid=6291](http://acm.hdu.edu.cn/showproblem.php?pid=6291)

**题意**：略。

**思路**：出现偶数次想到将一个数异或起来判断出现次数奇偶性，可以注意到出现偶数次最后结果即为 $0$，且异或具有可以差分的性质，所以我们可以建立一棵树上主席树，权值线段树维护的是对应权值的异或和，每次查询的时候我们可以通过主席树的加加减减得到查询路径的权值线段树。然后接下来找最小的偶数就相当于找第一个叶子节点异或和为 $0$ 的位置，直接在权值线段树上二分找就可以了，和找 $mex$ 是一样的。因为直接异或对应的值肯定不对，可能出现 $1$ 异或 $2$ 等于 $3$ 然后 $1,2$ 代替掉 $3$ 的情况，所以我们直接随机一个 $[0,2^{64})$ 以内的权值就可以极大概率的避免冲突了。还有一个天坑就是可能 $[1,20000]$ 都是出现奇数次，这时候答案是 $20001$，所以我们要把权值线段树范围开到 $20001$。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef unsigned long long ull;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=200000+10;
int T,n,m,i,u,v,cnt,root[N],a[N],son[N],dep[N],sz[N],fa[N],bel[N],ls[N*20],rs[N*20];
ull sum[N*20],val[N],pre[N];
vector<int>G[N];
inline ull Rand(){
	return (((ull)rand()%32768ll)<<45ll)+(((ull)rand()%32768ll)<<30ll)
		  +(((ull)rand()%32768ll)<<15ll)+((ull)rand()%32768ll);
}
void ins(int&y,int last,int l,int r,int pos,ull v){
	sum[y=++cnt]=sum[last]^v;
	if (l==r) return;
	int mid=l+((r-l)>>1);
	ls[y]=ls[last],rs[y]=rs[last];
	if (pos<=mid) ins(ls[y],ls[last],l,mid,pos,v);
	else ins(rs[y],rs[last],mid+1,r,pos,v);
}
void dfs(int u,int f){
	fa[u]=f,sz[u]=1,son[u]=-1,dep[u]=dep[f]+1;
	ins(root[u],root[f],1,200001,a[u],val[a[u]]);
	for (int i=0;i<(int)G[u].size();i++){
		int v=G[u][i];
		if (v==f) continue;
		dfs(v,u);
		sz[u]+=sz[v];
		if (son[u]==-1 || sz[son[u]]<sz[v]) son[u]=v;
	}
}
void dfs2(int u,int f){
	bel[u]=f;
	if (son[u]==-1) return;
	dfs2(son[u],f);
	for (int i=0;i<(int)G[u].size();i++){
		int v=G[u][i];
		if (v==fa[u] || v==son[u]) continue;
		dfs2(v,v);
	}
}
int lca(int u,int v){
    for (;bel[u]!=bel[v];dep[bel[u]]>dep[bel[v]]?u=fa[bel[u]]:v=fa[bel[v]]);
    return dep[u]>dep[v]?v:u;
}
int query(int A,int B,int C,int D,int l,int r){
	if (l==r) return l;
	int mid=l+((r-l)>>1);
	if ((sum[ls[A]]^sum[ls[B]]^sum[ls[C]]^sum[ls[D]])!=(pre[mid]^pre[l-1]))
		return query(ls[A],ls[B],ls[C],ls[D],l,mid);
	else
		return query(rs[A],rs[B],rs[C],rs[D],mid+1,r);
}
int main(){
	srand((unsigned)time(0));
	for (i=1;i<N;i++) val[i]=Rand();
	for (i=1;i<N;i++) pre[i]=pre[i-1]^val[i];
	for (read(T);T--;){
		read(n),read(m);
		for (cnt=0,i=1;i<=n;i++) G[i].clear();
		for (i=1;i<=n;i++) read(a[i]);
		for (i=1;i<n;i++){
			read(u),read(v);
			G[u].PB(v);
			G[v].PB(u);
		}
		dfs(1,0);
		dfs2(1,1);
		for (;m--;){
			read(u),read(v);
			int f=lca(u,v);
			printf("%d\n",query(root[u],root[v],root[f],root[fa[f]],1,200001));
		}
	}
	return 0;
}
```', 'public', NULL, 'published', '["Segment Tree","Random"]', '2018-08-01T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('hdu-6268', 'HDUOJ 6268 Master of Subgraph', 'HDUOJ 6268 Master of Subgraph', '**题目链接**：[http://acm.hdu.edu.cn/downloads/CCPC2018-Hangzhou-ProblemSet.pdf](http://acm.hdu.edu.cn/downloads/CCPC2018-Hangzhou-ProblemSet.pdf)

**题意**：给你一棵树，每个节点有自己的价值 $w_i$，给定一个数字 $m$，问 $1-m$ 这 $m$ 个数字是否能用一个联通子图的价值和表示出来，能输出 $1$ 否则输出 $0$。

**思路**：先不考虑联通子图这个问题，那么整个问题就是一个裸的树形背包问题，我们把树的 $dfs$ 序建立出来，对于 $dfs$ 序上的每一个点，考虑如果自己选那么自己子树内就可以选，否则只有在这棵子树外面才可以选。设 $dp[i][j]$ 为 $dfs$ 序上 $[i,n]$ 位置对应的节点背包容量为 $j$ 是否能被表示出来，对于位置 $i$，如果选我们就从 $dp[i+1]$ 转移过来，不选我们就从 $dp[i+sz[id[i]]]$ 这个位置转移过来，$id[i]$ 表示 $dfs$ 序为 $i$ 的节点编号是什么,$sz[id[i]]$ 表示这个节点的子树大小是多少，从后往前进行 $dp$，最终 $dp[1]$ 就是以 $x$ 为根的树形背包的答案。考虑到需要联通子图，不能是一块一块的，我们即用点分治，每次求出包含重心的答案，然后递归下去即可，由于这里的 $m$ 很大，所以 $01$ 背包要用 $bitset$ 优化，时间复杂度 $O(\frac{nmlogn}{64})$。

```cpp
#include <bits/stdc++.h>
#define PB push_back
#define MP make_pair 
using namespace std;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0''||ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0''&&ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=3000+10;
int T,n,m,u,v,i,root,tot,sum,f[N],w[N],sz[N],sz2[N],val[N],id[N];
bool vis[N];
vector<int>G[N];
bitset<100005>g[N],res;
void getroot(int u,int fa){
	sz[u]=1,f[u]=0;
	for (int i=0;i<(int)G[u].size();i++){
		int v=G[u][i];
		if (v==fa || vis[v]) continue;
		getroot(v,u);
		sz[u]+=sz[v];
		f[u]=max(f[u],sz[v]);
	}
	f[u]=max(f[u],sum-sz[u]);
	if (f[u]<f[root]) root=u;
}
void dfs(int u,int fa){
	sz2[u]=1,val[++tot]=u,id[u]=tot;
	for (int i=0;i<(int)G[u].size();i++){
		int v=G[u][i];
		if (v==fa || vis[v]) continue;
		dfs(v,u);
		sz2[u]+=sz2[v];
	}
}
void solve(int u){
	vis[u]=1,tot=0,dfs(u,0);
	int i;
	for (i=1;i<=tot+1;i++) g[i].reset();
	g[tot+1].set(0);
	for (i=tot;i>=1;i--){
		int u=val[i];
		g[i]|=g[i+1]<<w[u];
		g[i]|=g[i+sz2[u]];
	}
	res|=g[1];
	for (i=0;i<(int)G[u].size();i++){
		int v=G[u][i];
		if (vis[v]) continue;
		sum=sz[v],root=0;
		getroot(v,0);
		solve(root);
	}
}
int main(){
	for (read(T);T--;){
		read(n),read(m);
		for (i=1;i<=n;i++) G[i].clear(),vis[i]=0;
		for (i=1;i<n;i++){
			read(u),read(v);
			G[u].PB(v);
			G[v].PB(u);
		}
		for (i=1;i<=n;i++) read(w[i]);
		res.reset(),sum=n,root=0,f[0]=n+1;
		getroot(1,0);
		solve(root);
		for (i=1;i<=m;i++) printf("%d",res[i]?1:0);
		puts(""); 
	}
	return 0;
}
```', 'public', NULL, 'published', '["DP","Divide and Conquer"]', '2018-04-16T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('hihocoder-98', 'hihocoder [Offer收割]编程练习赛98 占领树节点', '占领树节点', '**题目链接**：[http://hihocoder.com/contest/offers98/problem/4](http://hihocoder.com/contest/offers98/problem/4)

**题意**：略。

**思路**：假如先手选了一个点，那么后手肯定是在它选的点周围选一个点作为起始点，因为如果不是相邻的话，先手就可以先把它们之间的路先堵上，这是不优的，然后问题就转化成了树上选一个点，这个点相邻的点的最大子树大小（后手可占据的最多点数）是否小于 $n-$ 最大子树的大小（先手可占据的最少点数），如果满足的话这个点就可选，时间复杂度 $O(n)$。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
int n,i,j,fa[N],sz[N];
vector<int>G[N],vec;
void dfs(int u,int f){
    sz[u]=1;
    int mx=0;
    for (int i=0;i<(int)G[u].size();++i){
        int v=G[u][i];
        if (v==f) continue;
        dfs(v,u);
        sz[u]+=sz[v];
        mx=max(mx,sz[v]); 
    }
    mx=max(mx,n-sz[u]);
    if (mx<n-mx) vec.PB(u);
}
int main(){
    read(n);
    for (i=1;i<=n;++i){
        read(fa[i]);
        if(fa[i]){
            G[fa[i]].PB(i);
            G[i].PB(fa[i]);
        }
    }
    dfs(1,0);
    sort(vec.begin(),vec.end());
    printf("%d\n",(int)vec.size());
    for (i=0;i<(int)vec.size();++i){
        printf("%d\n",vec[i]);
    }
    return 0;
}
```', 'public', NULL, 'published', '["Game Theory"]', '2019-04-04T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('leetcode-fun-and-challenge-problems', '那些年邂逅的 LeetCode 趣/难题', '记录一下打 LeetCode 碰到的有趣的或者比较难的题目', '## 1397.找到所有好字符

**题目链接：**[https://leetcode.cn/problems/find-all-good-strings/description/](https://leetcode.cn/problems/find-all-good-strings/description/)

**题目难度：** Hard

**题意：**

给你两个长度为 `n` 的字符串 `s1` 和 `s2` ，以及一个字符串 `evil` 。请你返回 好字符串 的数目。

好字符串 的定义为：它的长度为 `n` ，字典序大于等于 `s1` ，字典序小于等于 `s2` ，且不包含 `evil` 为子字符串。

由于答案可能很大，请你返回答案对 $10^9 + 7$ 取余的结果。

**数据范围：** 

- $s1.length == n$

- $s2.length == n$

- $s1 <= s2$

- $1 <= n <= 500$

- $1 <= evil.length <= 50$

- 所有字符串都只包含小写英文字母。

**思路：**

首先这个问题可以按套路差分成两个问题，cal(s) 表示统计所有长度为 n 的字典序小于等于 s 且不包含字符串 evil 的答案，那么最后答案就是 cal(s2) - cal(s1) + check(s1)，check(s1) 表示如果 s1 包含 evil 则返回 0，否则返回 1，那么剩下就是要解决 cal(s) 怎么计算的问题了。我们可以建出 evil 字符串的状态自动机，主要就是 $trans[i][j]$ 表示当前在 i 节点，出边是 j 走到的节点，这部分和 AC 自动机基本是一致的。

我们先用 kmp 预处理出 evil 的 next 数组，那么我们可以分类讨论得出 

$$
trans[i][j]=\left\{\begin{matrix}i+1,evil[i]==''a''+j \\ trans[next[i-1]+1][j],evil[i]\neq ''a''+j\end{matrix}\right.
$$ 

注意这里 $trans[i][j]$ 的 i 其实是字符串的第 i - 1 位，因为字符串下标从 0 开始，而这里我们需要一个额外的节点 0 代表其实节点。i - 1 的下一个即为 $evil[i]$，如果经过字符 j 能走到，那么就是 i + 1，否则要复用以前的信息，从失配的 $next[i - 1]$ 那里转移过来，由于下标整体加一了，所以是 $next[i - 1] + 1$。 这样我们得到了关于 evil 的自动机的状态转移图，剩下就是在上面 dp 就好了。

我们定义 $dp[i][j][0/1]$ 表示我们在自动机上从起点 0 出发走了 i 步，当前在 j 节点，得到字符串字典序小于或者等于字符串 s 的前 i 个字符的方案数，转移就很显然了。如果小于那么我们可以从小于或等于的状态转移过来，否则只能从等于的状态转移过来， $dp[i][j][0/1]$ 转移到 $dp[i+1][trans[j][k]][0/1]$ ，即走下一步的时候我们从出边 k 走，那么由于有之前预处理好的转移数组，所以下一步走到的节点即为 $trans[j][k]$ ，最后答案就是

$$
\sum_{i=0}^{evil.length-1}dp[n][i][0]+dp[n][i][1] 
$$ 

即我们只要不走到最后一个节点即必不包含字符串 evil ，时间复杂度为 $O(Snm)$ ，其中 $S$ 为字符集大小，$n$ 为字符串的长度，$m$ 为 evil 的长度。

**代码：**

```cpp
class Solution {
public:
    const int P=1000000007;
    int i,j,k,m,dp[505][55][2],nxt[505],trans[55][26];
    void up(int&a,int b){a+=b;if(a>=P)a-=P;}
    int cal(string s,int n){
        memset(dp,0,sizeof(dp));
        int ans=0;
        dp[0][0][1]=1;
        for (int i=1;i<=n;++i){
            for (int j=0;j<26;++j){
                for (int k=0;k<m;++k){
                    up(dp[i][trans[k][j]][0],dp[i-1][k][0]);
                    if (j<s[i-1]-''a'') up(dp[i][trans[k][j]][0],dp[i-1][k][1]);
                    else if (j==s[i-1]-''a'') up(dp[i][trans[k][j]][1],dp[i-1][k][1]);
                }
            }
        }
        for (int i=0;i<m;++i){
            up(ans,dp[n][i][0]);
            up(ans,dp[n][i][1]);
        }
        return ans;
    }
    int findGoodStrings(int n, string s1, string s2, string evil) {
        m=(int)evil.length();
        for (nxt[0]=j=-1,i=1;i<m;nxt[i++]=j){
            while (~j&&evil[j+1]!=evil[i]) j=nxt[j];
            j+=(evil[j+1]==evil[i]);
        }
        trans[0][evil[0]-''a'']=1;
        for (i=1;i<m;++i){
            for (j=0;j<26;++j){
                if (evil[i]-''a''==j) trans[i][j]=i+1;
                else trans[i][j]=trans[nxt[i-1]+1][j];
            }
        }
        int ans=cal(s2,n)-cal(s1,n);
        if (s1.find(evil)==string::npos) ans++;
        ans%=P;
        if (ans<0) ans+=P;
        return ans;
    }
};
```

---
## 1531. 压缩字符串II

**题目链接：**[https://leetcode.cn/problems/string-compression-ii/description/](https://leetcode.cn/problems/string-compression-ii/description/)

**题目难度：** Hard

**题意：**

行程长度编码 是一种常用的字符串压缩方法，它将连续的相同字符（重复 2 次或更多次）替换为字符和表示字符计数的数字（行程长度）。例如，用此方法压缩字符串 "aabccc" ，将 "aa" 替换为 "a2" ，"ccc" 替换为` "c3" 。因此压缩后的字符串变为 "a2bc3" 。

注意，本问题中，压缩时没有在单个字符后附加计数 ''1'' 。

给你一个字符串 s 和一个整数 k 。你需要从字符串 s 中删除最多 k 个字符，以使 s 的行程长度编码长度最小。

请你返回删除最多 k 个字符后，s 行程长度编码的最小长度 。


**数据范围：** 

- $1 \le s.length \le 100$

- $0 \le k \le s.length$

- s 仅包含小写英文字母

**思路：**

定义 $dp[i][j]$ 表示考虑字符串 $[0,i]$ 的前缀，删除了 $j$ 个字符的行程长度编码的最小长度。

考虑转移方程，枚举第 $i$ 个字符删或不删，如果删除的话 

$$
\rm dp[i][j]=\min(\rm dp[i][j],\rm dp[i-1][j-1])
$$

如果不删的话，我们从后往前枚举字符 $i$ 在末尾连续多少次，并将中间不是 $i$ 的字符删去，我们假设前者数量为 $\rm same$，后者数量为 $\rm del$，当前枚举到了 $m$，那么转移方程即为 

$$
\rm dp[i][j]=\min(\rm dp[i][j],\rm dp[m-1][j-\rm del]+cal(\rm same))
$$

其中 $\rm cal(\rm same)$ 为压缩后的编码数量，**不删转移的正确性有待研究，因为我们可以选择中间的一个子集来进行转移而不是连续段，但有时候就是要大但猜测一下才能过**。

时间复杂度 $O(n^2k)$，其中 $n=s.length$。

**代码：**

```cpp
class Solution {
public:
    #define INF 0x3f3f3f3f
    int len(int k){
        if (k <= 1) return 0;
        else if (k > 1 && k < 10) return 1;
        else if (k >= 10 && k < 100) return 2;
        else return 3;
    }
    int getLengthOfOptimalCompression(string s, int k) {
        int n = s.size();
        vector<vector<int>> dp(n + 1, vector<int>(k + 1, INF));
        dp[0][0] = 0;
        for(int i = 1; i <= n; ++i) {
            for(int j = 0; j <= k && j <= i; ++j) {
                if (j > 0) dp[i][j] = min(dp[i][j], dp[i - 1][j - 1]);
                int same = 0, del = 0;
                for(int m = i; m >= 1; --m) {
                    if (s[m - 1] == s[i - 1]) same++;
                    else del++;
                    if (j - del >= 0) {
                        dp[i][j] = min(dp[i][j], dp[m - 1][j - del] + 1 + len(same));
                    } else {
                        break;
                    }
                }
            }
        }
        return dp[n][k];
    }
};
```

---
## 1536. 排布二进制网格的最少交换次数

**题目链接：**[https://leetcode.cn/problems/minimum-swaps-to-arrange-a-binary-grid/description/](https://leetcode.cn/problems/minimum-swaps-to-arrange-a-binary-grid/description/)

**题目难度：** Hard

**题意：**

给你一个 n x n 的二进制网格 grid，每一次操作中，你可以选择网格的 相邻两行 进行交换。

一个符合要求的网格需要满足主对角线以上的格子全部都是 0 。

请你返回使网格满足要求的最少操作次数，如果无法使网格符合要求，请你返回 -1 。

主对角线指的是从 (1, 1) 到 (n, n) 的这些格子。

**数据范围：** 

- $n == grid.length$

- $n == grid[i].length$

- $1 \le n \le 200$

- grid[i][j] 要么是 0 要么是 1 

**思路：**

从上到下逐行确定，假设当前考虑到第 $i$ 行，第 $0 \ldots i-1$ 行都已经确定好。按题意第 $i$ 行满足的条件为末尾连续零的个数大于等于 $n-i-1$， 那么我们考虑将 $[i \ldots n-1]$ 中的**离第 $i$ 行最近的且满足限制条件的那一行**逐行交换到第 $i$ 行。

我们可以考虑假设当前有若干行都能满足第 $i$ 行，那么这些行一定都满足第 $i+1 \ldots n-1$ 的限制条件，也就是说能交换到第 $i$ 行的那些行一定也能交换到后面几行，因为随着行数的增加，限制条件越来越宽松。因此不会存在贪心地选择后，后面出现无法放置的情况。

**代码：**

```cpp
class Solution {
public:
    int minSwaps(vector<vector<int>>& grid) {
        int n = grid.size();
        vector<int> pos(n, -1);
        for (int i = 0; i < n; ++i) {
            for (int j = n - 1; j >= 0; --j) {
                if (grid[i][j] == 1) {
                    pos[i] = j;
                    break;
                }
            }   
        }
        int ans = 0;
        for (int i = 0; i < n; ++i) {
            int k = -1;
            for (int j = i; j < n; ++j) {
                if (pos[j] <= i) {
                    ans += j - i;
                    k = j;
                    break;
                }
            }
            if (~k) {
                for (int j = k; j > i; --j) {
                    swap(pos[j], pos[j - 1]);
                }
            } else {
                return -1;
            }
        }
        return ans;
    }
};
```', 'public', NULL, 'published', '["LeetCode"]', '2020-03-30T15:47:09.263Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('leetcode-typescript-interview-questions', 'LeetCode 中国区 TypeScript 面试题题解', 'TypeScript 类型编程题', '## 写在前面

最近在学 TypeScript, 对类型编程有点感兴趣？虽然自己可能对这方面还是一无所知。恰好发现LeetCode国区有这么道开源的[面试题](https://github.com/LeetCode-OpenSource/hire/blob/master/typescript_zh.md)，就拿过来做了下。

## 简要题解

其实分析一下我们的需求就是两点：
１．将EffectModule类的函数签名的类型改了
２．将EffectModule类的非函数属性都去掉

对于第一点，我们可以直接根据题目的要求遍历实例的键，利用infer的推断能力拿到payload的属性还有函数签名里Promise和Action泛型里的值，拿到后根据题目要求换成需要的函数签名即可：

```typescript
type Change<T> = {[K in keyof T]: 
  T[K] extends ((input: Promise<infer P>) => Promise<{payload: infer U;type:string}>)? 
    ((input: P) => Action<U>):
  T[K] extends ((action: Action<infer P>) => {payload: infer U;type:string})?
    ((action: P) => Action<U>):
  never;}

const effectModule = new EffectModule();
type test = Change<typeof effectModule>;
```

经过Change的变换后我们得到的test类型其实是包含 ```count:never``` 和 ```message:never``` 两个属性，我们要去掉它，所以我们利用extends判断类型是不是函数从而拿出EffectModule类的非函数属性键的名字，然后利用Omit方法去掉这些非函数属性的键即可，具体实现如下：

```typescript
type omitFuncKeys<T> = {[K in keyof T]: T[K] extends Function? never: K}[keyof T];
type final = Omit<Change<typeof effectModule>, omitFuncKeys<EffectModule>>;
```
---
#### 完整代码：

```typescript
import { expect } from "chai";

interface Action<T> {
  payload?: T;
  type: string;
}

class EffectModule {
  count = 1;
  message = "hello!";

  delay(input: Promise<number>) {
    return input.then(i => ({
      payload: `hello ${i}!`,
      type: ''delay''
    }));
  }

  setMessage(action: Action<Date>) {
    return {
      payload: action.payload!.getMilliseconds(),
      type: "set-message"
    };
  }
}
// 实现部分
type Change<T> = {[K in keyof T]: 
  T[K] extends ((input: Promise<infer P>) => Promise<{payload: infer U;type:string}>)? 
    ((input: P) => Action<U>):
  T[K] extends ((action: Action<infer P>) => {payload: infer U;type:string})?
    ((action: P) => Action<U>):
  never;}

const effectModule = new EffectModule();
type omitFuncKeys<T> = {[K in keyof T]: T[K] extends Function? never: K}[keyof T];
type final = Omit<Change<typeof effectModule>, omitFuncKeys<EffectModule>>;
// 修改 Connect 的类型，让 connected 的类型变成预期的类型
type Connect = (module: EffectModule) => final;

const connect: Connect = m => ({
  delay: (input: number) => ({
    type: ''delay'',
    payload: `hello 2`
  }),
  setMessage: (input: Date) => ({
    type: "set-message",
    payload: input.getMilliseconds()
  })
});

type Connected = {
  delay(input: number): Action<string>;
  setMessage(action: Date): Action<number>;
};

export const connected: Connected = connect(new EffectModule());
```', 'public', NULL, 'published', '["TypeScript"]', '2020-04-13T14:49:46.666Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('loj-6163', 'loj 6163 「美团 CodeM 初赛 Round A」 合并回文子串', 'loj 6163 「美团 CodeM 初赛 Round A」 合并回文子串', '**题目链接**：[https://loj.ac/problem/6163](https://loj.ac/problem/6163)

**题意**：略。

**思路**：区间DP。设 $dp[i][j][k][l]$ 为用 $[i,j]$ 和 $[k,l]$ 的子串拼接成的字符串的最大价值，然后列出四种情况下的状态转移方程(详见代码)，边界条件就是 $(lena=0 \&\& lenb=1) || (lena=1 \&\& lenb=0)$ 的时候价值为 $1$，$lena=0 \&\& lenb=0$ 的时候价值为 $0$。

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn=50+5;
const int INF=0x3f3f3f3f;
template<typename T>
inline T read(T&x){
    x=0;int _f=0;char ch=getchar();
    while(ch<''0''||ch>''9'')_f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
    return x=_f?-x:x;
}
int dp[maxn][maxn][maxn][maxn];
char a[maxn],b[maxn];
int T;
int main(){
    for (read(T);T;T--){
        scanf("%s",a+1);
        scanf("%s",b+1);
        int n=(int)strlen(a+1),m=(int)strlen(b+1);
        int ans=0;
        for (int lena=0;lena<=n;lena++){
            for (int lenb=0;lenb<=m;lenb++){
                for (int i=1,j=lena;j<=n;i++,j++){
                    for (int k=1,l=lenb;l<=m;k++,l++){
                        if (lena==0 && lenb==0) dp[i][j][k][l]=0;
                        else if ((lena==0 && lenb==1)||(lena==1 && lenb==0)) dp[i][j][k][l]=1;
                        else{
                            dp[i][j][k][l]=-INF;
                            if (i<j && a[i]==a[j]) dp[i][j][k][l]=max(dp[i][j][k][l],dp[i+1][j-1][k][l]+2);
                            if (k<l && b[k]==b[l]) dp[i][j][k][l]=max(dp[i][j][k][l],dp[i][j][k+1][l-1]+2);
                            if (i<=j && k<=l && a[i]==b[l]) dp[i][j][k][l]=max(dp[i][j][k][l],dp[i+1][j][k][l-1]+2);
                            if (i<=j && k<=l && a[j]==b[k]) dp[i][j][k][l]=max(dp[i][j][k][l],dp[i][j-1][k+1][l]+2);
                        }
                        ans=max(ans,dp[i][j][k][l]);
                    }
                }
            }
        }
        printf("%d\n",ans);
    }
    return 0;
}
```', 'public', NULL, 'published', '["DP"]', '2017-06-30T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('loj-6377', 'LOJ 6377 「是男人就过8题——Pony.ai」 A String Game', 'LOJ 6377 「是男人就过8题——Pony.ai」 A String Game', '**题目链接**：[https://loj.ac/problem/6377](https://loj.ac/problem/6377)

**题意**：略。

**思路**：$n$ 个字符串可以看做独立的游戏，对 $t$ 串建立后缀自动机后得到一张有向无环图，然后求一下每个状态为起点的时候 $sg$ 值，对每个字符串，直接在后缀自动机上走然后终点就是这个字符串对应的 $sg$ 值了，直接异或起来即可。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB emplace_back
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
    x=0;int f=0;char ch=getchar();
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
    return x=f?-x:x;
}
const int N=1e5+10;
const int S=26;
int tot,last,i,j,len,T,sg[N<<1],firstpos[N<<1],sum[N<<1],pre[N<<1],son[N<<1][S],ml[N<<1];
char s[N],t[N];
void init(){
	tot=last=1;
	memset(son,0,sizeof(son));
	memset(sg,-1,sizeof(sg));
}
void extend(int w){
	int p=++tot,x=last,r,q;firstpos[p]=ml[x];
	for (ml[last=p]=ml[x]+1;x&&!son[x][w];x=pre[x]) son[x][w]=p;
	if (!x) pre[p]=1;
	else if (ml[x]+1==ml[q=son[x][w]]) pre[p]=q;
	else{
		pre[r=++tot]=pre[q];memcpy(son[r],son[q],sizeof(son[r]));
		ml[r]=ml[x]+1;pre[p]=pre[q]=r;firstpos[r]=firstpos[q];
		for (;x&&son[x][w]==q;x=pre[x]) son[x][w]=r;
	}
}
int dfs(int idx){
	if (~sg[idx]) return sg[idx];
	set<int>SG;
	for (int i=0;i<S;++i)if(son[idx][i]){
		SG.insert(dfs(son[idx][i]));
	}
	for (int i=0;;++i) if(SG.find(i)==SG.end()) return sg[idx]=i; 
}
int getSG(const char *s){
	int cur=1;
	for (int i=0;s[i];++i){
		cur=son[cur][s[i]-''a''];
	}
	return sg[cur];
}
int main(){
	while (~scanf("%s",s+1)){
		len=strlen(s+1);
		init();
		for (i=1;i<=len;++i) extend(s[i]-''a'');
		dfs(1);
		int ans=0;
		for (read(T);T--;){
			scanf("%s",t+1);
			ans^=getSG(t+1);
		}
		puts(ans?"Alice":"Bob");
	}
	return 0;
}
```', 'public', NULL, 'published', '["String","Game Theory"]', '2019-04-08T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('random-thought', '一些随想', 'Nothing...', '可能是想记录点什么，就开了个坑。

正式当社畜快两个月了，也逐渐融入了现在的工作环境，认识了很多大佬，也看到了自己的渺小，上一周心态被事情堆的心态有点爆炸，这两天又变得佛系了起来，不过接下来可能要做一个大需求，要加把劲呀。

晚上帮范宇过了遍实习生的转正答辩，提了些小意见，希望他明天能顺利答辩。9 月的题解题单也出来了，可是自己写的欲望不是很大，因为感觉都是一些很无聊的题目，得抽个时间搞。

这两个月因为一个人心态搞的不太好，每天浑浑噩噩的，当然一切都是我的锅，一下子回到了高中的心态，不过知道时间总会解决这一切的。叠加上工作的一些事情，总会对自己有所怀疑，也没有宣泄的出口。

当然，由于浑浑噩噩，所以也没学什么东西，计划的 todo list 都被我搁置了，算法水平也感觉下降的很厉害，接下来应该会抽时间做做 cf 的题找找感觉，不要让自己的唯一优势都没了。

感觉自己也会订个双月目标，反正 10 月底前争取整理完 js 的思维导图吧，然后入门图形学以及学些编译原理 / 密码学的东西，当然后两者就不要硬性要求了（不过一定会学的），还是先把本专业的东西整整熟，体重怎么也得到 80 kg，还有输出两篇技术型文章，反正，加油吧。

昨天看完了[白非立上进记](https://zhuanlan.zhihu.com/p/91072728)，感触很多，也在思考大学四年为了一个所谓漂亮的绩点是不是浪费了很多时间，不过时光无法倒流，只能继续向前走了呀。

最后，还是希望能当好一个社畜，多认识一些人，把握当下，不要再浪费时间了，保持对技术的热忱。', 'public', NULL, 'published', '["随笔"]', '2020-08-26T14:51:43.011Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('record-2019', '回顾 2019', '简单回顾一下 2019 年吧..', '是不是要说些什么...

可能午时一过我就要消失了...(不是

上半年和孟凡月还有学弟杨子江去打了应该是属于我的最后一场比赛，虽然赛前训练都很猛的样子，然而去现场还是被打爆了，拿了银牌。没啥借口好找的，只希望学弟明年能拿金牌吧，反正我也失败惯了...

最大的感慨可能是又在一个十字路口上作了抉择，选择去当一名社畜，依旧不知道是不是正确的抉择...只能交给时间去validate了...

暑假去深圳腾讯实习，一个人从深圳机场出来的时候，望着街上人来人往，感受到了一丝恐惧，给导师发了条微信然后就坐地铁去中转住宿了。第一天去报到的时候还是很懵，一个人都不认识的感觉真的好差...然后就在导师位置上等导师开完会回来，正式开始了我的实习，记得早上导师带我一个个人介绍过来，最后我的脑子仍然一片空白，中午导师请客吃饭的时候一个人名字都叫不出来（捂脸），不过渐渐的也跟大家熟悉了起来，适应了环境，参与了一些或大或小的项目。当然最大的收获还是认识了一群很好的组员还有我心目中自认为最好最牛逼的导师，大家不仅很强还很有趣，虽然比我大很多（？雾）。同组的实习生混的应该是最熟的了，经常抱团取暖瑟瑟发抖（不是），饭后也聊很多，不管是未来还是别的，发现在这个时间点上大家很多的担忧或者是顾虑是很一致的，经常有共鸣，不过由于自己还是更想呆在杭州，所以9月份就辞职回杭州找工作了，没有选择留下来qwq，希望IMWeb团队以后越来越好吧，最后一天走的时候送了导师我精心挑选的礼物（不是），跟他道别后去机场的路上很遗憾没去要张合照啊（？，只有自己平时疯狂偷拍的一些照片（不是）。

回来就找工作了…顺便报名学车，然后被刷学时坑到12月才正式碰车，不过这中间也遇到了形形色色的人，包括一起练车的杭职的小姐姐还有计量的同学，只能说学车的过程没有那么枯燥吧，科目二也在上上周考掉了，一起练车的基本都过了（5/6），也相约了同一个科三的时间打算一起去考，感觉还是可以的啊？

最近又被某wooyme聚聚带入坑玩云顶之弈，狂玩了几天，冷静了一下发现毕设还没动（太难了），要抓紧时间搞一下...

好像今年就这样了啊...回顾了一下可能大概也许是比去年这个时候的我要强了一些。除此之外，今年可能感觉到自己的心越来越冰冷了，可能对一些分别之事越来越麻木了，暑假实习同组实习生离职的时候自己大概就难受了一会儿，没有像以前那样感慨万千，不知道是好事还是坏事，也许是真的想明白了天下没有不散的宴席一说。越来越习惯自己一个人出门，带着耳机在大街上乱逛，没人的时候就哼两句歌。很多人事其实很想去维系，可是更多时候自己失去了那份维系的勇气，所以也就被我放在那了，然后就没了。

In the end，自己实习转正答辩的时候也立了很多flag，目前拔flag进度有点缓慢，希望2020能顺利拔完然后尽快适应当一名社畜，好好学习，天天向上，结识更多有趣的人也尽量让自己变的有趣吧。', 'public', NULL, 'published', '["Life"]', '2019-12-31T07:22:36.154Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('record-2020', '回顾 2020', '简单回顾一下 2020 年吧..', '2021 年马上要 3 月了我才开始写我的年终总结真是咕咕咕。。。

## 毕业

上半年我顺利毕业，还顺便拿了个优秀毕设，记得底下评审老师还问我为啥不做科研，我笑了笑说道: “我可能智力不够吧”。在高考完进入杭电的这四年，我一直在思考我到底是考研还是工作还是出国，其实从内心深处我渴望用考研证明自己，证明自己的高考和中考只是失误，但是两次人生重要转折点的失败已经让我不能再去面对第三次的失败了，因此考研上一个好的 985 & 211 终究只是我心底的一个梦罢了，或许其实我已经认清了现实，我就是一个平庸的人，注定做不了大事。

好像又扯远了 = =，讲讲毕业前这半年做了啥，1 月份的时候顺利过了科目三和科目四拿到了驾照，同行的小伙伴也基本上都过了，非常快乐。寒假的时候又舔着脸跟学弟去了一次 Camp，或许还是放不下竞赛吧，玩的很开心，后面学弟也都取得了很好的成绩，为他们高兴呀～到家的时候疫情就爆发了，基本上就被关在了房间里，每天吃了睡，睡了吃，直接导致体重直线飙升 = =，本来按计划是大四下回学校减肥的啊 qwq，后来提前向钦涛问了他实习的时候都在做什么，就自己在家里学习了 React 和 TypeScript，博客也用 Gatsby 重新搭了下，还顺便提了两个 PR，都已经合入 Gatsby 的代码了，这个世界总算留下了点我的印记？

期间也为毕业设计想破了头，为了完成一点点的创新工作（我真的不是在给自己加难度么），还写了点 matlab 和 C++ 代码，所幸进度还算顺利，开题报告前就基本上全搞完了了，后面导师也说会把我的毕业论文整理成小论文争取能发到啥期刊上，其实没太敢想这件事情。科研所谓的创新性是我骨子里一直缺失的，我可能学习别人的经验很熟练，花时间就行，但自己要有所创新就很难了，毕设的创新点其实在我眼里非常不值一提，这也跟我学术水平十分低下有关。

后来到 5 6 月份的时候我就提前去实习了，得知我要做小程序引擎相关的内容，一开始还挺茫然的，后来也渐渐熟悉了起来，期间也是周末的时候回学校见见同学，搬点东西回去，其实也没见几次，就散了。拍毕业照的那几天其实我一直没有什么感触，冷酷到我以为我终于变得冷血了。过去二十几年一直是一个很感性的人，也是一个很敏感的人，习惯了在生活中观察别人的行为来揣摩别人的想法，也很容易因为一点小事导致自己心情抑郁，心底一直认为这是不好的，也在努力让自己变的冷血而不要因为离别而伤感。然而终究到离别的最后一天，我还是突然一阵难受，记得拍毕业照那几天宇哥还跟我讲了一些话，印象也很深，有些东西可能就是无法改变的吧。打开了一个个寝室门，跟他们说了再见，有些人还在睡梦中我也没有叫醒，最后跟王锐告别转身以后我终于还是没崩住眼泪。一个人拖着行李箱前往地铁的时候，过去的一些事情在脑海里放映，也在感慨时间真的好快。

## 工作

时间不会等你，还没来得及感慨时光飞逝就要正式工作了。

工作这半年其实感觉也非常快，有时候还没反映过来这半年就结束了，逐渐熟悉了小程序引擎的业务，结识了一些人，经历了很多事情，曾经对这份工作满怀热情，终究在半年后消亡了，决定去做些真正想做的事情，开始重新捡起 C++，也打算学点图形学，希望我的人生不要就这么白过了吧。

曾经以为自己结交的好友，最终发现其实别人也不会把你放在心上，有的时候会在想为什么会这样，是我太讨人厌了么，还是我哪里做的不好，我都不得而知，唯一知道的是不能再把别人当回事了，太累了，还是做好自己吧。

## 展望

2021 年绩效评估刚过去，因为过去半年的种种事情，我已经不求有好的绩效了。前几天跟益恩聊天的时候他说要自己主动学会去找点事情做，我觉得很有道理，我老是被动的去接受上面层层压下来的任务，总是怀着很糟糕的心情和很大的压力在做着一件件事情，其实我内心是有些简单的想法的，但总是没有付诸行动。希望新的一轮周期，能主动思考去发现一些需要改进的地方，还有在接到新需求的时候能从更全面的角度评估需求的合理性，不要再给自己留下遗憾了。

BTW：希望新的一年能按计划瘦到 75 公斤以下 2333，72 公斤或许就是一个不错的 Target ? 然后就可以去不断提升身体素质了，以及多去尝试一些新的事物，拓展自己的视野也是极好的 2333。

**希望一切都好**。', 'public', NULL, 'published', '["Life"]', '2021-02-28T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('type-challenge-bubble-sort', 'Type Challenge - 冒泡排序', '用 TypeScript 类型实现冒泡排序', '## 背景

受公司内一位大神写的一篇用 TypeScript 类型实现斐波那契数列，萌发了用 TypeScript 类型实现冒泡排序的想法，于是有了这篇文章，文中的一些 Util 类型很多搬运了那篇文章，因此在这里提前感谢那位大神。

**注：本文代码在 TypeScript 4.2.3 的版本下跑通，低版本可能出现部分特性不支持的情况。同时由于本人水平很低，本文实现并不是很完美，存在很多限制以及潜在可以改进的地方，欢迎指出，不吝赐教。**

## 目标

用 TypeScript 类型实现冒泡排序，即：

```typescript
type Result = BubbleSort<[2, 3, 30, 6, 1, 4]> // type Result = [1, 2, 3, 4, 6, 30]
```

## 思路

首先我们需要知道冒泡排序的算法原理以及用 JavaScript 实现的代码，由于整个算法不是很复杂，故这里贴一下百度百科的词条来做参考：https://baike.baidu.com/item/%E5%86%92%E6%B3%A1%E6%8E%92%E5%BA%8F/4602306?fr=aladdin。

对应的 JavaScript 代码如下：

```javascript
function bubbleSort(arr) {
    for (let i = 0; i < arr.length; ++i) {
        for (let j = arr.length - 1; j > i; --j) {
            if (arr[j - 1] >= arr[j]) {
                arr[j - 1] = arr[j - 1] ^ arr[j];
                arr[j] = arr[j] ^ arr[j - 1];
                arr[j - 1] = arr[j - 1] ^ arr[j];
            }
        }
    }
    return arr;
}
```

用 TypeScript 类型实现一个基于比较的排序算法核心点要解决三个问题：

1. 实现两个数字的比较
2. 嵌套循环的处理
3. 相邻数字的交换

我将在下文一一讲述。

### 实现两个数字的比较

在 TypeScript 的体系里是没有数字比较的概念的，我们需要另辟蹊径，这里给出的方案（也是上文提到那篇文章的方案）为创建对应数字大小长度的 Array，然后不断弹出出元素，看哪个 Array 长度先为 $0$ 即可比较出大小。

#### 一些 Util 类型

首先定义一些后面会用到的工具类型：

```typescript
// 数组长度
type Length<T extends any[]> = T[''length''];
// And 操作
type And<X extends boolean, Y extends boolean> = X extends true ? Y extends true ? true : false : false; 
// 判断数组是否非空
type NotEmpty<T extends number[]> = Length<T> extends 0 ? false : true;
// 判断数组是否为空
type IsEmpty<T extends number[]> = NotEmpty<T> extends true ? false : true;
// 数组 shift 操作
type Shift<T extends number[]> = T extends [unknown, ...infer R] ? R : [];
```

#### 给定数字如何创建对应长度的数组

一个简单的思路为 for 循环创建：

```typescript
function createArray(targetNumber: number) {
    const newArray = [];
    for (let i = 0; i < targetNumber; ++i) {
    	newArray.push(0);
	}
    return newArray;
}
```

由于 TypeScript 不支持循环，我们只能用递归来代替循环，终止条件为已创建的数组长度等于给定数字，然后不断递归往待创建的数组中推入任意元素，具体实现如下：

```typescript
type CreateArray<T extends number, P extends number[] = []> = Length<P> extends T ? P : CreateArray<T, [0, ...P]>;
```

**注：在低版本 TypeScript 中其实是不支持如上的自递归，那时候如果要实现可以借助对象来绕过去，具体实现如下，后面如果出现自递归也可以同理这么修改，不再赘述：**

**注2：TypeScript 的递归深度是有限制的，不超过 $50$，因此不能表示很大的数字，这也是本文实现的一个很大的缺陷。**

```typescript
type CreateArray<T extends number, P extends number[] = []> = {
    0: CreateArray<T, [0, ...P]>,
    1: P
}[Length<P> extends T ? 1 : 0];
```

#### 比较两个数字大小

有了上述的基础，再来实现就不是很难了，假定我们要实现如下比较 $A$ 是否小于等于 $B$ 的类型：

```typescript
type LessEqual<A extends number, B extends number> // 如果 A <= B 返回 true，否则返回 false
```

根据前文所说的我们创建对应长度的数组，不断同时弹出两个数组的元素，如果 $A$ 对应的数组先空，即返回 $\rm true$ 否则返回 $\rm false$ 。

```typescript
// 如果两个数组都非空（And<NotEmpty<A>, NotEmpty<B>>）则继续递归弹出两个数组的元素（LessEqualArray<Shift<A>, Shift<B>>），直到有一个为空，如果 A 对应的数组先空了，则说明 A <= B
type LessEqualArray<A extends number[], B extends number[]> = And<NotEmpty<A>, NotEmpty<B>> extends true ? LessEqualArray<Shift<A>, Shift<B>> : IsEmpty<A> extends true ? true : false;
type LessEqual<A extends number, B extends number> = LessEqualArray<CreateArray<A>, CreateArray<B>>;
```

### 嵌套循环的处理

冒泡排序需要一个嵌套的 for 循环，外层循环控制 $n - 1$ 轮比较，内层循环每次从数组末尾开始不断比较相邻元素 $\textit{arr}[j-1]$ 和 $\textit{arr}[j]$，如果 $\textit{arr}[j-1]>\textit{arr}[j]$ 则交换相邻数字，这样一轮比较后待排序的元素中最小的元素就会冒泡到数组前面。

而前文在讲述创建对应长度的数组已经提到针对一个 for 循环我们可以用自递归的方法来实现，因此我们是有实现单层循环的能力的，那么嵌套循环也就很好解决：我们可以再定义一个类型表示内层循环，循环每次返回一轮比较后的数组即可。

我们先定义外层循环的类型：

```typescript
type BubbleSort<T extends number[], Index extends number = 0>
```

其中 $T$ 表示待排序的数组，$\textit{Index}$ 表示外层的循环变量。按照前文所述，循环，或者说递归终止的条件为 $\textit{Index} $ 等于 $\textit{len} - 1$，每次递归不断将 $\textit{Index}$ 加一。因此我们还需要实现数字的自增和自减的类型，由前面的铺垫，这个也不难实现：

```typescript
// 自增
type Inc<A extends number> = Length<CreateArray<A> extends [...infer U] ? [...U, 0] : []>;
// 自减
type Dec<A extends number> = Length<CreateArray<A> extends [...infer U, any] ? U : []>;
```

至此外层循环类型实现就呼之欲出了：

```typescript
type BubbleSort<T extends number[], Index extends number = 0> = 
    Inc<Index> extends Dec<Length<T>> ? T : BubbleSort<OnceBubble<T, Index>, Inc<Index>>;
```

其中 `OnceBubble<T, Index>` 为我们要实现的内层循环，它返回一轮比较后的新数组，具体实现结合下一小节给出。

#### 相邻数字的交换

由于我 TypeScript 水平本身比较薄弱，不能给出很优雅的方法来实现数字的交换，因此给出的方案需要在内层循环自递归的时候额外记录一个数组 $\textit{SuffixArray}$ 表示当前已经比较过的元素数组。

定义内层循环的类型：

```typescript
type OnceBubble<T extends number[], I extends number = 0, J extends number = Dec<Length<T>>, SuffixArray extends number[] = []>
```

其中 $T$ 为待排序数组，$I$ 表示循环终止条件，即外层循环变量，$J$ 表示内层循环变量，从 $\textit{len}-1$ 开始，$\textit{SuffixArray}$ 表示 $[J + 1, \textit{len} -1]$ 这段已经比较过的数组元素。

有了 $\textit{SuffixArray}$ 我们就可以愉快的进行交换了，整体实现如下：

```typescript
type OnceBubble<T extends number[], I extends number = 0, J extends number = Dec<Length<T>>, SuffixArray extends number[] = []> = 
    J extends I 
    ? T : LessEqual<T[Dec<J>], T[J]> extends true
    ? OnceBubble<T, I, Dec<J>, [T[J], ...SuffixArray]> :
    OnceBubble<
        T extends [...infer PreArray, infer A, infer B, ...SuffixArray] ? [...PreArray, B, A, ...SuffixArray] : [],
        I,
        Dec<J>,
        [T[Dec<J>], ...SuffixArray]
    >;
```

即如果没有循环结束，那么我们比较相邻元素的大小，如果发现不用交换就执行 `OnceBubble<T, I, Dec<J>, [T[J], ...SuffixArray]>`，否则利用 $\rm infer$ 的能力重组出交换后的数组：

```typescript
T extends [...infer PreArray, infer A, infer B, ...SuffixArray] ? [...PreArray, B, A, ...SuffixArray] : []
```

内层循环结束的时候返回交换后数组即可。

至此，我们实现了整个冒泡排序。

## 完整代码

- [Playground](https://www.typescriptlang.org/play?ts=4.2.3&ssl=1&ssc=1&pln=23&pc=46#code/C4TwDgpgBAMhB2BzYALAPAFShAHsBAJgM5QCG8IA2gLoB8UAvFBpQOQA2CyKr1A3AChQkKAEF4BNAA1seQiQBGAeyWdyAGigBNWfgmKVa+PSYzce4lGAAnAK7QA-Nt3yrdx2-tQAXFABmpOxE0L4BQRB8UELg0ADKKACWfsCYLvpQ8LYAtgoQ1jQmzGmWlLbwANbwSgDu8JoAdI0J8H55UABK1FBO7T5QNILC0ABySsAAollgoKnmrpk5eQWMsFyomPRz6QAM3f6BwX029oMxUACSRJPTILNy6Qu5+XQroxNTMxib95bHHmGHXx-U4iADC1ggpHwoms1lItywW0sjzymgACsUSCjnitlkw4Eh1mjvhYSFgnBjfODIdDYfDMJpKNsGo00XQQdA4EQrgBHWyBGFw26iTEZbJPGiaABCouxeLEEjQb2uM1EtE0yo+tyltBJrj+ey5vP57EF9PiSRSas0FuSaB19F8lxVwr16QNTgNoQOEWiIiN4z5gTQIqRWPFqKgMrDYsW1kKAaDprpt2pUIgZtdmjTtKF9t1HIu8AAxiHZRH4ysCdw0DmMymQ26So16s1WtYoABVLpOSgtzuabZdXwFQsAEQgpdDP3DcYTa3QdczjdFfaaLTaA7IFB7Xb6o790AA8iWIFLbAoFJw7qTYxLqJpzuW4ytmVAAFLPp4rCel6vrL51SgWJbD8PwEhwTMvyWLomHlAQoEQj9RSfBCkKcLBfETE1MEoX80HfWgH2YSh3xeGM-jQxCnBPYszwvK8IAZC5NHwwjGRYMiWXqECwIgzMXm8KioFo+jL2vYSkKKGM11bDcOzRCFM00Ns2lEFT5KjbjePAyCU13WTFPrIVpU0dSoBbHT+P0-cH0kpDznUezELY9VnP6FhXOIyzQN0gThNoQtz3EiBYiUawUkRGc7xgx8JFwaCOyYbZCmE84SzQdKCFwJsSHw-90EAvZMKjBjODCiK0FE4LGOYrKcri0t6pwAtDw6CAiFsdhgBWGryvClJKAAJk0ABmMa3wANk0ABGTQABY6CAA)

```typescript
type Length<T extends any[]> = T[''length''];
type And<X extends boolean, Y extends boolean> = X extends true ? Y extends true ? true : false : false; 
type Shift<T extends number[]> = T extends [unknown, ...infer R] ? R : [];
type NotEmpty<T extends number[]> = Length<T> extends 0 ? false : true;
type IsEmpty<T extends number[]> = NotEmpty<T> extends true ? false : true;
type CreateArray<T extends number, P extends number[] = []> = Length<P> extends T ? P : CreateArray<T, [0, ...P]>;
type LessEqualArray<A extends number[], B extends number[]> = And<NotEmpty<A>, NotEmpty<B>> extends true ? LessEqualArray<Shift<A>, Shift<B>> : IsEmpty<A> extends true ? true : false;
type LessEqual<A extends number, B extends number> = LessEqualArray<CreateArray<A>, CreateArray<B>>;
type Inc<A extends number> = Length<CreateArray<A> extends [...infer U] ? [...U, 0] : []>;
type Dec<A extends number> = Length<CreateArray<A> extends [...infer U, any] ? U : []>;
type OnceBubble<T extends number[], I extends number = 0, J extends number = Dec<Length<T>>, SuffixArray extends number[] = []> = 
    J extends I 
    ? T : LessEqual<T[Dec<J>], T[J]> extends true
    ? OnceBubble<T, I, Dec<J>, [T[J], ...SuffixArray]> :
    OnceBubble<
        T extends [...infer PreArray, infer A, infer B, ...SuffixArray] ? [...PreArray, B, A, ...SuffixArray] : [],
        I,
        Dec<J>,
        [T[Dec<J>], ...SuffixArray]
    >;
type BubbleSort<T extends number[], Index extends number = 0> = 
    Inc<Index> extends Dec<Length<T>> ? T : BubbleSort<OnceBubble<T, Index>, Inc<Index>>;
type Result = BubbleSort<[2, 3, 30, 6, 1, 4]>
```

## 回顾

本文实现其实存在很多不足，比较致命的就是受限于 TypeScript 递归的深度限制，只能对较小的数字以及较短的数组进行排序，不过本身就是一个没什么用的东西（划掉），所以开心就好，娱乐至上，一切内容仅供参考。', 'public', NULL, 'published', '["TypeScript"]', '2021-05-08T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('union-pay-D', '银联极客高校挑战赛复赛 D 多项式', '', '**题目链接**：[https://nanti.jisuanke.com/t/40551](https://nanti.jisuanke.com/t/40551)

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
    while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
    while (ch>=''0''&& ch<=''9'') x=x*10+ch-''0'',ch=getchar();
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
```', 'public', NULL, 'published', '["DP"]', '2019-09-17T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('uoj-192', 'UOJ 192 最强跳蚤', 'UOJ 192 最强跳蚤', '**题目链接**：[http://uoj.ac/contest/28/problem/192](http://uoj.ac/contest/28/problem/192)

**题意**：略。

**思路**：完全平方数意味着这个数里面质因子出现次数均为偶数，由又异或具有差分的特性，所以我们可以对每个点分解质因数，求出这个点到根每个质因子数的前缀异或和，然后只要两个点每个质因子数前缀异或和相异或后为 $0$ 就说明这个质因子数在这个路径的异或和的权值上出现了偶数次，只要每个质因子都如此即可保证这条路径权值异或和是完全平方数。但这样直接暴力维护肯定不行，因为权值太大了，质因子数很多很多，所以我们考虑对一个质因子数随机一个 $[0,2^{64})$ 里的权值，然后这个条边权就相当于分解质因子后权值的异或和，我们再求前缀异或和，只要两个点异或和相等那么两个点的简单路径权值一定是完全平方数，排个序扫一下就可以了。随机的正确性就在于冲突性很小，可以忽略不计。

```cpp
#include <bits/stdc++.h>
#define MP make_pair
#define PB push_back
using namespace std;
typedef unsigned long long ull;
const int N=1e4+10;
int n,i,j,p,u,v,w,primes[N];
ull val[N],sum[N*10]; 
map<int,ull>mp;
vector<pair<int,int> >G[N*10];
ull get(){return (ull)rand()*rand();}
ull getSingleHash(int x){
	if (mp.find(x)!=mp.end()) return mp[x];
	return mp[x]=get();
}
ull getHash(int x){
	ull ret=0;
	for (int i=1;i<=primes[0];i++){
		if (x<primes[i]) break;
		if (x%primes[i]==0){
			while (x%primes[i]==0){
				x/=primes[i];
				ret^=val[i];
			}
		}
	}
	if (x>1) ret^=getSingleHash(x);
	return ret;
}
void init(){
	srand((unsigned long long)new char);
	for (int i=2;i<=10000;i++){
		if (!primes[i]) primes[++primes[0]]=i;
		for (int j=1;j<=primes[j]&&i*primes[j]<=10000;j++){
			primes[i*primes[j]]=1;
			if (i%primes[j]==0) break;
		}
	}
	for (int i=1;i<=primes[0];i++) val[i]=get();
}
void dfs(int u,int f){
	for (int i=0;i<(int)G[u].size();i++){
		int v=G[u][i].first;
		if (v==f) continue;
		sum[v]=sum[u]^getHash(G[u][i].second);
		dfs(v,u);
	}
}
int main(){
	init();
	scanf("%d",&n);
	for (i=1;i<n;i++){
		scanf("%d%d%d",&u,&v,&w);
		G[u].PB(MP(v,w));
		G[v].PB(MP(u,w));
	}
	dfs(1,0);
	sort(sum+1,sum+1+n);
	long long ans=0;
	for (i=1,p;i<=n;i=p){
		p=n+1;
		for (j=i+1;j<=n;j++){
			if (sum[j]!=sum[i]){
				p=j;
				break;
			}
		}
		ans+=1LL*(p-i)*(p-i-1);
	}
	printf("%lld\n",ans);
	return 0;
}
```', 'public', NULL, 'published', '["Random"]', '2018-07-31T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('wanna-2B', 'Wannafly 挑战赛2 B-Travel', 'Wannafly 挑战赛2 B-Travel', '**题目链接**：[https://www.nowcoder.com/acm/contest/17/B](https://www.nowcoder.com/acm/contest/17/B)

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

```', 'public', NULL, 'published', '["Shortest Path"]', '2017-10-28T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('wanna-7C', 'Wannafly 练习赛7 C 随机树', 'Wannafly 练习赛7 C 随机树', '**题目链接**：[https://www.nowcoder.com/acm/contest/38/C](https://www.nowcoder.com/acm/contest/38/C)

**题意**：略。

**思路**：观察知，题目中给定了素因子的范围很小只有 $6$ 个，且由约数个数定理可以知道我们只要知道每个素因子的个数我们就可以知道约数的个数，所以有如下思路：首先把树转成 $DFS$ 序线性区间，然后开 $6$ 颗线段树维护每个位置每个素因子的个数，对于操作 $1$，即单点更新，乘 $x$ 就相当于把 $x$ 的每个素因子个数加到对应的位置上，对于操作 $2$，线段树成段查询素因子个数和就可以了，然后根据约数个数定理和唯一分解定理配合快速幂还原即可.

```cpp
#include <bits/stdc++.h>
#define lson root<<1,l,mid
#define rson root<<1|1,mid+1,r
using namespace std;
const int maxn=1e5+5;
const int P=1e9+7;
typedef long long ll;
int n,u,v,q,dfs_clock,id[maxn],L[maxn],R[maxn],in[maxn],a[maxn];
int primes[]={2,3,5,7,11,13};
int ans[6];
ll sum[maxn<<2][6];
char s[10];
vector<int>G[maxn];
void dfs(int u,int f){
    L[u]=++dfs_clock;
    id[dfs_clock]=u;
    for (int i=0;i<(int)G[u].size();i++){
        int v=G[u][i];
        if (v==f) continue;
        dfs(v,u);
    }
    R[u]=dfs_clock;
}
void pushup(int root){
    for (int i=0;i<6;i++) sum[root][i]=sum[root<<1][i]+sum[root<<1|1][i];
}
void build(int root,int l,int r){
    if (l==r){
        int tmp=a[id[l]];
        for (int i=0;i<6;i++){
            int cnt=0;
            if (tmp%primes[i]==0){
                while (tmp%primes[i]==0){
                    tmp/=primes[i];
                    cnt++;
                }
            }
            sum[root][i]=cnt;
        }
        return;
    }
    int mid=l+((r-l)>>1);
    build(lson);
    build(rson);
    pushup(root);
}
void query(int root,int l,int r,int L,int R){
    if (L<=l && r<=R){
        for (int i=0;i<6;i++){
            ans[i]+=sum[root][i];
        }
        return;
    }
    int mid=l+((r-l)>>1);
    if (L<=mid) query(lson,L,R);
    if (mid<R) query(rson,L,R);
    pushup(root);
    return;
}
void update(int root,int l,int r,int u,int v){
    if (l==r){
        int tmp=v;
        for (int i=0;i<6;i++){
            int cnt=0;
            if (tmp%primes[i]==0){
                while (tmp%primes[i]==0){
                    tmp/=primes[i];
                    cnt++;
                }
            }
            sum[root][i]+=cnt;
        }
        return;
    }
    int mid=l+((r-l)>>1);
    if (u<=mid) update(lson,u,v);
    else update(rson,u,v);
    pushup(root);
}
int ksm(int a,int n){
    int res=1;
    while (n){
        if (n&1) res=(1LL*res*a)%P;
        a=(1LL*a*a)%P;
        n>>=1;
    }
    return res;
}
int main(){
    scanf("%d",&n);
    for (int i=2;i<=n;i++){
        scanf("%d%d",&u,&v);
        u++,v++;
        G[u].push_back(v);
        in[v]++;
    }
    int f;
    for (int i=1;i<=n;i++) if (in[i]==0){
        f=i;
        break;
    }
    dfs(f,-1);
    for (int i=1;i<=n;i++) scanf("%d",&a[i]);
    build(1,1,n);
    for (scanf("%d",&q);q--;){
        scanf("%s",s);
        if (s[0]==''R''){
            int u;scanf("%d",&u);
            u++;
            memset(ans,0,sizeof(ans));
            query(1,1,n,L[u],R[u]);
            int a=1,num=1;
            for (int i=0;i<6;i++){
                a=1LL*a*(ans[i]+1)%P;
                num=1LL*num*ksm(primes[i],ans[i])%P;
            }
            printf("%d %d\n",num,a);
        }
        else{
            int u,x;scanf("%d%d",&u,&x);
            u++;
            update(1,1,n,L[u],x);
        }
    }
    return 0;
}

```', 'public', NULL, 'published', '["Segment Tree","Math"]', '2017-12-01T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('zoj-4008', 'ZOJ 4008 Yet Another Tree Query Problem', 'ZOJ 4008 Yet Another Tree Query Problem', '**题目链接**：[http://acm.zju.edu.cn/onlinejudge/showProblem.do?problemCode=4008](http://acm.zju.edu.cn/onlinejudge/showProblem.do?problemCode=4008)

**题意**：给定一棵树，若干询问，求节点编号在 $[L,R]$ 里的点进行连边后形成的连通块数量。

**思路**：对于一棵树，你连一条边就相当于并查集进行了一次有效的合并操作，连通分量数减一，所以问题就转化为求 $R-L+1-[L,R]$ 中节点的连边数，后面那个我们把每条边小的编号看做 $x$ 轴上的值，大的编号看做 $y$ 轴上的值，这样一条边就看作了一个点，节点连边数就看成了一个二维数点的问题，扫描线配合树状数组就可以解了。我们将询问也看成一个点，本来应该是查 $(L,L),(R,R)$ 这两个点围成的矩形内的点的数量，但是之前连边的特殊性，我们从 $x$ 轴大到小边插入边查询，就可以保证到 $L$ 的时候不会查到 $(L$，比 $L$ 小$)$ 和 $($ 比 $R$ 大，$R)$ 的点，直接树状数组查找小于 $R$ 的点的数量有多少个就可以了，时间复杂度 $O(nlogn)$。

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
#define mp make_pair
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
    while(ch<''0''||ch>''9'')_f|=(ch==''-''),ch=getchar();
    while(ch>=''0''&&ch<=''9'')x=x*10+ch-''0'',ch=getchar();
    return x=_f?-x:x;
}
const int N=2e5+10;
int T,n,Q,u,v,i,l,r,cnt,ans[N],sum[N];
struct _{
	int x,y,t;
	bool operator <(const _&rhs)const{
		if (x^rhs.x) return x>rhs.x;
		return t<rhs.t;
	}
}q[N*2];
inline int lowbit(int x){return x&(-x);}
inline void add(int x){for(;x<=n;x+=lowbit(x))sum[x]++;}
inline int get(int x){
	int res=0;
	for (;x>0;x-=lowbit(x)) res+=sum[x];
	return res;
}
int main(){
	for (read(T);T--;){
		read(n),read(Q);
		memset(sum,0,sizeof(sum));
		for (cnt=0,i=1;i<n;i++){
			read(u),read(v);
			if (u>v) swap(u,v);
			q[++cnt]=(_){u,v,0};
		}
		for (i=1;i<=Q;i++){
			read(l),read(r);
			ans[i]=r-l+1;
			q[++cnt]=(_){l,r,i};
		}
		sort(q+1,q+1+cnt);
		for (i=1;i<=cnt;i++){
			if(q[i].t) ans[q[i].t]-=get(q[i].y);
			else add(q[i].y);
		}
		for (i=1;i<=Q;i++) printf("%d\n",ans[i]);
	}
	return 0;
}
```', 'public', NULL, 'published', '["BIT"]', '2018-03-12T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
INSERT INTO "post" ("slug","title","description","body","visibility","password","status","tags","publishedAt","createdAt","updatedAt") VALUES ('zoj-4098', 'ZOJ 4098 Defense Plan', 'ZOJ 4098 Defense Plan', '**题目链接**：[http://acm.zju.edu.cn/onlinejudge/showProblem.do?problemCode=4098](http://acm.zju.edu.cn/onlinejudge/showProblem.do?problemCode=4098)

**题意**：有 $n$ 个点，$m$ 对互斥关系 $(x,y)$ 表示选了 $x$ 就不能选 $y$,选了 $y$ 就不能选 $x$，一个可行点集的价值是这些点价值的乘积，求所有可行方案的方差。

**思路**：我们先把方差公式化简一下，可以得到

$$
S^2=\frac{\sum_{i=1}^{k}x_i^2}{k}-\overline{x}^2
$$

所以我们只要知道 $\sum_{i=1}^{k}x_i$, $\sum_{i=1}^{k}x_i^2$, $k$ 即可算出答案，考虑到 $n$ 有 $40$，我们折半搜出两边的答案。考虑如何整合两边的答案，其实就是两边的集合拼起来以后依然是一个合法集合，所以我们第二遍搜到一个可行集合的时候，可以根据互斥关系求出对于前半个点集可选的点集，然后这个点集的子集都是满足条件的，我们只要知道这个点集的所有子集和然后去乘第二遍搜到的答案就可以了，求一个状态的所有子集和，可以再第一遍搜完以后高维前缀和优化，然后就可以通过了。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
template<typename T>
inline T read(T&x){
	x=0;int f=0;char ch=getchar();
	while (ch<''0'' || ch>''9'') f|=(ch==''-''),ch=getchar();
	while (ch>=''0'' && ch<=''9'') x=x*10+ch-''0'',ch=getchar();
	return x=f?-x:x;
}
const int N=40+10;
const int P=1e9+7;
int n,m,i,x,y,A,B,C,status,a[N],w[N],g2[N],g3[N],dp[(1<<22)+10],dp2[(1<<22)+10],dp3[(1<<22)+10];
ll g[N];
inline void up(int &a,int b){a+=b;if(a>=P)a-=P;}
int fexp(int a,int n){
	int res=1;
	while (n){
		if (n&1) res=1LL*res*a%P;
		a=1LL*a*a%P;
		n>>=1;
	}
	return res;
}
void dfs(int x,int tot,int val,int val2,int SS,int S){
	if (x==tot+1){
		up(dp[SS],val);
		up(dp2[SS],1);
		up(dp3[SS],val2);
		return;
	}
	dfs(x+1,tot,val,val2,SS,S);
	if (!(S>>x&1)) dfs(x+1,tot,1LL*val*w[x]%P,1LL*val2*a[x]%P,SS|(1<<x),(S|g2[x])|(1<<x));
}
void dfs2(int x,int tot,int val,int val2,int SS,int S){
	if (x==tot+1){
		int S2=0;
		for (int i=1;i<=n-n/2;++i)if(SS>>i&1){
			for (int j=1;j<=n/2;++j)if(g[i+n/2]>>j&1){
				S2|=1<<j;
			}
		}
		for (int j=1;j<=n/2;++j){
			S2^=1<<j;
		}
		up(A,1LL*val*dp[S2]%P);
		up(B,dp2[S2]);
		up(C,1LL*val2*dp3[S2]%P);
		return;
	}
	dfs2(x+1,tot,val,val2,SS,S);
	if (!(S>>x&1)) dfs2(x+1,tot,1LL*val*w[x+n/2]%P,1LL*val2*a[x+n/2]%P,SS|(1<<x),(S|g3[x])|(1<<x));
}
int main(){
	read(n),read(m);
	for (i=1;i<=n;++i) read(w[i]),a[i]=1LL*w[i]*w[i]%P;
	for (i=1;i<=m;++i){
		read(x),read(y);
		if (x<=n/2 && y<=n/2) g2[x]|=1<<y,g2[y]|=1<<x;
		else if (x>n/2 && y>n/2) g3[x-n/2]|=1<<(y-n/2),g3[y-n/2]|=1<<(x-n/2);
		g[x]|=1LL<<y,g[y]|=1LL<<x;
	}
	dfs(1,n/2,1,1,0,0);
	for (i=0;i<=n/2;++i){
        for (status=0;status<(1<<(n/2+1));++status){
            if (status&(1<<i)){
            	up(dp[status],dp[status^(1<<i)]);
        		up(dp2[status],dp2[status^(1<<i)]);
        		up(dp3[status],dp3[status^(1<<i)]);
        	}
        }
    }
	dfs2(1,n-n/2,1,1,0,0);

	int ans=1LL*C*fexp(B,P-2)%P;
	A=1LL*A*fexp(B,P-2)%P;
	A=1LL*A*A%P;
	ans=(ans-A)%P;
	if (ans<0) ans+=P;
	printf("%d\n",ans);
	return 0;
}
```', 'public', NULL, 'published', '["DP","DFS"]', '2019-04-16T00:00:00.000Z', '2026-06-28T04:00:45.348Z', '2026-06-28T04:00:45.348Z') ON CONFLICT("slug") DO NOTHING;
