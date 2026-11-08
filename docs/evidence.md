# 证据与结论边界

## 漏洞路径

1. 已登录的后台向 `PUT /cgi-bin/DAL?oid=logset` 提交日志设置。
2. `LogMode` 为远程或本地加远程时，DAL 将 `LogServer` 写入日志配置对象。前端长度限制不能充当后端转义；分析到的字段路径没有 IP 格式约束。
3. 后端把该值作为未转义的 `%s` 放入 syslog-ng 的 `udp("%s" ...)` 配置行，然后重建配置并重启日志服务。
4. 在这台官方 7.2C0 设备上，配置语法注入引入的 `program()` 源被执行。现有管理员 SSH PTY 观察到 `id` 的 `uid=0(root) gid=0(root)` 输出。
5. 临时 root 执行通道之后用于修改运行时账户文件。新的管理员 SSH 登录及独立 `id -u` 返回 `0`，证明完整 root shell 可用。

这是**需要有效后台登录的权限提升**。网页升级入口、SSH 服务开关、固件型号/FWID 检查、日志配置注入和 root SSH 是不同步骤，不能合并成一个“SSH 认证绕过”结论。尚无本项目核实的 CVE 编号。

## 私人原始记录索引

原始文件含内网配置或设备信息，**未纳入仓库**。下列 SHA-256 用来指认原始记录版本；此页只摘录支持结论的非敏感字段。

| 原始记录名 | SHA-256 | 本项目引用的事实 |
| --- | --- | --- |
| `menu-result-live.json` | `dc828d4d4467472751fc45da7c40e1624a2f15d01111595518a9c265246fca01` | Y1 `medium` 管理员的 `Firmware_Upgrade` 页面项已写入并从服务端读回。 |
| `router-ssh-LAN-result.json` | `dbdf32c2d0ba4c173497736633b121bad71997ed9af23fea1c839d4a3ad2de12` | SSH 管理模式改为 `LAN_ONLY` 并读回。 |
| `router-ssh-command-check.json` | `50732370ef88b966e0f7a311a15b975fafb71a9102d92b3c60b5798cce160d8f` | Y1 管理员进入 `ZySH>`，两项镜像检查当时均启用。 |
| `C0-after-checks-off-result.json` | `faaccec05451bbd83b4628a53a5b281740b39a5c8f5670dad8ee60cb4336a3c3` | Y1 至官方 7.2C0 的操作顺序、启动后版本和登录验证。 |
| `C0-logserver-static-analysis.md` | `646b2be8dea51e23989f98c885c9e0ec2358b117bde1bd1da8a529d1a1840e5f` | `LogServer` 从 DAL 到 syslog-ng 配置的静态数据流和恢复顺序。 |
| `C0-root-uid-proof.json` | `74bb12bc8865181c4f84e55a0ac357a2e697e7a41b7ec2058e7f282611bc5eee` | SSH PTY 中独立观察到 root UID，日志设置恢复核对通过。 |
| `C0-admin-root-SSH-result.json` | `3b7663ae50106e4ead0f2c33d8dee47a3ca81017b403fd1e9061be353563d7c8` | `admin` 新 SSH 会话获得 `uid=0`，仅当前启动验证。 |
| `C0-root-password-change-result.json` | `6cd9dcc1c62451e5da1eb3c872632bd1ba03ef1b623cf0d3ab7e860b067d950a` | root 凭据在运行时更新并重新登录；重启持久性未知。 |

## 不能从这些证据推出的结论

- 不能断言匿名用户、WAN 侧用户或仅能登录普通 SSH 菜单的账户可直接触发该路径。
- 不能把“Y1 上关闭型号/FWID 检查后 C0 上传成功”推广为对任意镜像或 7.2C0 RSA 签名的绕过。
- 不能把运行时 `uid=0` 账号修改描述为重启后永久保留。
- 不能声称该方法在其他硬件批次、不同固件或已修复版本上验证过。
- 本仓库不提供原始配置备份、私钥、凭据、设备标识或固件二进制；要复核原始记录须由设备所有者在受控环境中提供。
