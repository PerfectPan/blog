---
date: 2019-02-02
title: 删括号
description: 删括号
tag:
  - DP
---

**题目链接**：[https://ac.nowcoder.com/acm/problem/21303](https://ac.nowcoder.com/acm/problem/21303)

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
        if (a[i+1]=='(') f[i+1][j][k+1]=1;
        else if (k) f[i+1][j][k-1]=1;
    }
    puts(f[n][m][0]?"Possible":"Impossible");
    return 0;
}
```
