# 技术分析：从认证后的日志配置到 root SSH

## 研究范围与结论

研究对象是 Zyxel EX3301-T0 的官方固件 `V5.50(ABVY.7.2)C0`。以下结论基于一台设备的固件静态分析及经过设备所有者授权的本机验证，不能自动推广到其他固件或设备。

**已验证的结果：**具有管理权限的用户能够通过日志服务器配置触发以 Linux `uid=0` 运行的进程。利用这一临时 root 执行通道修改*运行时*账户文件后，原 `admin` 账户在新的 SSH 会话中获得完整 root shell；独立的 SSH `id -u` 调用返回 `0`。

这是 **LogServer 字段进入 syslog-ng 配置文件时未正确处理** 的问题。SSH 服务只是后续验证和账户登录的入口，现有证据不支持将其描述为 Dropbear 或 SSH 协议漏洞。全过程需要先通过管理认证；没有验证未认证攻击路径。

## 信任边界

```mermaid
flowchart LR
    A[已认证的管理会话] -->|PUT logset| B[DAL / RDM 配置]
    B -->|LogServer 被写入配置文本| C[syslog-ng 配置生成器]
    C -->|加载生成的配置| D[syslog-ng]
    D -->|program source| E[root 身份的进程]
    E -->|仅修改运行时账户文件| F[admin: UID/GID 0, /bin/sh]
    F --> G[新的 SSH root shell]
```

1. 管理页面使用 `PUT /cgi-bin/DAL?oid=logset` 更新日志配置。前端限制输入长度并在 `Local` 模式禁用输入框；这些前端约束不是服务端安全边界。
2. 固件的 DAL 函数在远程日志模式下将 `LogServer` 合并到 RDM 对象。已分析路径中未见针对该字段的 IP 地址语法校验；这不等于证明所有通用校验均不存在。
3. 后端 `beLogSetup` 将 `LogServer` 作为未转义的字符串插入 syslog-ng 的 `udp("…")` 配置语法，并重建配置文件、重启日志服务。配置注入与把字符串直接拼接进启动 syslog-ng 的 shell 命令是两回事。
4. 固件包含 syslog-ng 的 `program()` 驱动。该驱动会通过 `/bin/sh -c` 启动其程序源。设备上的一次受控验证观察到 `uid=0(root) gid=0(root)`。
5. 此时取得的是临时 root **命令执行**，尚不是交互式 root SSH。随后仅将 `admin` 的运行时 UID、GID 和登录 shell 分别改为 `0`、`0`、`/bin/sh`，其密码字段保持不变，再进行新的 SSH 登录验证。

## 可复核的静态证据

官方 7.2C0 固件样本 SHA-256：`1958230af33f46879f592f90fbd5cea0e16a51d5c352fa3c9560cb832df472bc`。下表中的地址来自提取的 MIPS ELF 静态分析；地址及分支的含义以本项目这一固件样本为限。

| 组件 | 观察 | 代表位置 |
| --- | --- | --- |
| `/lib/libzcfg_fe_dal.so` | `zcfgFeDalLogSettingcfg` 读取并合并 `LogMode`、`LogServer` | `0xDE614`；读取 `0xDE698–0xDE6F8` |
| `/lib/private/libzcfg_be.so` | `beLogSetup` 将日志服务器字段放入 syslog-ng 配置格式串 | `0xF8B48`；UDP 写入 `0xF94EC–0xF9538` |
| `/lib/private/libzcfg_be.so` | 生成临时配置，替换正式配置并重启 syslog-ng | `0xFA3F8–0xFA4E8` |
| `/usr/lib/syslog-ng/libafprog.so` | `program()` 驱动执行 `/bin/sh -c` | `0x2A98–0x2ABC` |

这条路径还解释了一个恢复细节：有效模式为 `Local` 时，DAL 跳过 `LogServer` 更新。因此，在验证后直接一次性提交 `Local` 和原始 `LogServer` 值不能可靠地清除暂存字段。原始记录是在远程模式下先清除该字段、读取确认，再恢复 `Local` 并比对完整日志配置；每次提交都可能重启日志服务。

## 活机验证与限制

| 阶段 | 观察 | 可以得出的结论 |
| --- | --- | --- |
| 初始 SSH | `admin` 登录进入 `ZySH>`；相同凭据直接登录 `root` 失败 | 管理员账户最初没有直接获得 Linux root shell |
| 临时执行 | 管理员 SSH PTY 中出现 `uid=0(root) gid=0(root)` | 日志配置链在该固件设备上实现了 root 命令执行；当时尚未获得交互式 root SSH |
| 账户提升 | `admin` 的运行时 UID/GID 从 `21` 变为 `0`，shell 从 `/usr/bin/zysh` 变为 `/bin/sh` | 后续 SSH 会话使用了 Linux root 身份；密码字段及其他账户未改变 |
| 独立 SSH 复验 | 新会话成功，`id -u` 输出 `0` | 当前启动周期内的完整 root SSH 已验证 |
| 清理 | 原日志配置字段完整恢复；未因这次提权写固件分区或切换启动槽 | 临时注入配置已清除；不构成设备整体安全状态证明 |

`/etc/passwd` 指向运行时的 `/tmp/var/passwd`。原厂账户生成流程可能在重启或重新生成账户时覆盖本次修改；**没有验证 admin 的 root SSH 权限可以跨重启保留**。后来使用系统 `passwd` 修改 root 的运行时密码并完成新 SSH 登录验证，但该变更未同步到原厂账户数据，也没有验证重启持久性。这两项运行时变更不应写成永久提权。其他账户的创建或开机持久化方案不属于已验证成果。

本仓库不提供设备凭据、配置备份、固件二进制或可直接针对设备运行的载荷。具体设备地址、SSH 主机指纹和个人网络标识也未收录。
