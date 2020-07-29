---
date: 2020-03-30T15:47:09.263Z
title: 那些年邂逅的 LeetCode 趣/难题
description: 记录一下打 LeetCode 碰到的有趣的或者比较难的题目
tag:
  - LeetCode
---
#### 1397.找到所有好字符

**题目链接：**<https://leetcode-cn.com/problems/find-all-good-strings/>

**题目难度：**Hard

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
trans[i][j]=\left\{\begin{matrix}i+1,evil[i]=='a'+j \\ trans[next[i-1]+1][j],evil[i]\neq 'a'+j\end{matrix}\right.
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
                    if (j<s[i-1]-'a') up(dp[i][trans[k][j]][0],dp[i-1][k][1]);
                    else if (j==s[i-1]-'a') up(dp[i][trans[k][j]][1],dp[i-1][k][1]);
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
        trans[0][evil[0]-'a']=1;
        for (i=1;i<m;++i){
            for (j=0;j<26;++j){
                if (evil[i]-'a'==j) trans[i][j]=i+1;
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
#### 1531. 压缩字符串II

**题目链接：**<https://leetcode-cn.com/problems/string-compression-ii>

**题目难度：**Hard

**题意：**

行程长度编码 是一种常用的字符串压缩方法，它将连续的相同字符（重复 2 次或更多次）替换为字符和表示字符计数的数字（行程长度）。例如，用此方法压缩字符串 "aabccc" ，将 "aa" 替换为 "a2" ，"ccc" 替换为` "c3" 。因此压缩后的字符串变为 "a2bc3" 。

注意，本问题中，压缩时没有在单个字符后附加计数 '1' 。

给你一个字符串 s 和一个整数 k 。你需要从字符串 s 中删除最多 k 个字符，以使 s 的行程长度编码长度最小。

请你返回删除最多 k 个字符后，s 行程长度编码的最小长度 。


**数据范围：** 

- $1 \le s.length \le 100$

- $0 \le k \le s.length$

- s 仅包含小写英文字母

**思路：**

定义 $dp[i]\[j]$ 表示考虑字符串 $[0,i]$ 的前缀，删除了 $j$ 个字符的行程长度编码的最小长度。

考虑转移方程，枚举第 $i$ 个字符删或不删，如果删除的话 

$$\rm dp[i]\[j]=\min(\rm dp[i]\[j],\rm dp[i-1]\[j-1])$$

如果不删的话，我们从后往前枚举字符 $i$ 在末尾连续多少次，并将中间不是 $i$ 的字符删去，我们假设前者数量为 $\rm same$，后者数量为 $\rm del$，当前枚举到了 $m$，那么转移方程即为 

$$\rm dp[i]\[j]=\min(\rm dp[i]\[j],\rm dp[m-1]\[j-\rm del]+cal(\rm same))$$

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
