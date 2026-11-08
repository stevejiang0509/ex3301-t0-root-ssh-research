# Zyxel advisory: CVE-2026-6952

Zyxel's [security advisory, first released 21 July 2026](https://www.zyxel.com/global/en/support/security-advisories/zyxel-security-advisory-for-post-authentication-command-injection-vulnerability-in-certain-dsl-ethernet-cpe-fiber-onts-and-wireless-extenders-07-21-2026), identifies a post-authentication command injection flaw in the `LogServer` field of the syslog component. An authenticated attacker with administrator privileges could execute operating system commands on an affected device. Zyxel says WAN access is disabled by default and that exploitation requires compromised user-configured passwords.

The **EX3301-T0 on V5.50(ABVY.7.2)C0 is within the advisory's affected range**, 5.50(ABVY.8)C0 and earlier. Zyxel lists **5.50(ABVY.8.1)C0** as the patch for the EX3301-T0. This is a vendor version comparison, not a local exploit or patch test. The advisory does not specify that commands execute as `root`, name a particular `syslog-ng` function, or describe an internal execution path. Those details require separate device or firmware evidence.

## Official affected products and patches

The following table transcribes the model, affected-version, and patch pairs in Zyxel's July advisory. Versions without a leading `V` follow the advisory's notation.

| Product category | Model | Affected version | Patch availability |
| --- | --- | --- | --- |
| DSL/Ethernet CPE | DX3300-T0 | 5.50(ABVY.8)C0 and earlier | 5.50(ABVY.8.1)C0 |
| DSL/Ethernet CPE | DX3300-T1 | 5.50(ABVY.8)C0 and earlier | 5.50(ABVY.8.1)C0 |
| DSL/Ethernet CPE | DX3301-T0 | 5.50(ABVY.8)C0 and earlier | 5.50(ABVY.8.1)C0 |
| DSL/Ethernet CPE | DX4510-B0 | 5.17(ABYL.10.2)C0 and earlier | 5.17(ABYL.10.3)C0 |
| DSL/Ethernet CPE | DX4510-B1 | 5.17(ABYL.10.2)C0 and earlier | 5.17(ABYL.10.3)C0 |
| DSL/Ethernet CPE | DX5401-B1 | 5.17(ABYO.7.2)C0 and earlier | 5.17(ABYO.7.3)C0 |
| DSL/Ethernet CPE | EE3301-00 | 5.63(ACMU.3.1)C0 and earlier | 5.63(ACMU.3.2)C0 |
| DSL/Ethernet CPE | EE5301-00 | 5.63(ACLD.3.1)C0 and earlier | 5.63(ACLD.3.2)C0 |
| DSL/Ethernet CPE | EE6510-10 | 5.19(ACJQ.4.2)C0 and earlier | 5.19(ACJQ.4.3)C0 |
| DSL/Ethernet CPE | EMG3525-T50B | 5.50(ABPM.9.8)C0 and earlier | 5.50(ABPM.9.9)C0 |
| DSL/Ethernet CPE | EMG5523-T50B | 5.50(ABPM.9.8)C0 and earlier | 5.50(ABPM.9.9)C0 |
| DSL/Ethernet CPE | EX2210-T0 | 5.50(ACDI.2.5)C0 and earlier | 5.50(ACDI.2.6)C0 |
| DSL/Ethernet CPE | EX3300-T0 | 5.50(ABVY.8)C0 and earlier | 5.50(ABVY.8.1)C0 |
| DSL/Ethernet CPE | EX3300-T1 | 5.50(ABVY.8)C0 and earlier | 5.50(ABVY.8.1)C0 |
| DSL/Ethernet CPE | **EX3301-T0** | **5.50(ABVY.8)C0 and earlier** | **5.50(ABVY.8.1)C0** |
| DSL/Ethernet CPE | EX3500-T0 | 5.44(ACHR.5.1)C0 and earlier | 5.44(ACHR.6)C0 |
| DSL/Ethernet CPE | EX3501-T0 | 5.44(ACHR.5.1)C0 and earlier | 5.44(ACHR.6)C0 |
| DSL/Ethernet CPE | EX3600-T0 | 5.70(ACIF.2.1)C0 and earlier | 5.70(ACIF.3.1)C0 |
| DSL/Ethernet CPE | EX5512-T0 | 5.70(ACEG.5.6)C0 and earlier | 5.70(ACEG.5.7)C0 |
| DSL/Ethernet CPE | EX5401-B1 | 5.17(ABYO.7.2)C0 and earlier | 5.17(ABYO.7.3)C0 |
| DSL/Ethernet CPE | EX5601-T0 | 5.70(ACDZ.6)C0 and earlier | 5.70(ACDZ.6.1)C0 |
| DSL/Ethernet CPE | EX5601-T1 | 5.70(ACDZ.6)C0 and earlier | 5.70(ACDZ.6.1)C0 |
| DSL/Ethernet CPE | EX7501-B0 | 5.18(ACHN.3.2)C0 and earlier | 5.18(ACHN.3.3)C0 |
| DSL/Ethernet CPE | EX7710-B0 | 5.18(ACAK.1.7)C0 and earlier | 5.18(ACAK.1.8)C0 |
| DSL/Ethernet CPE | GM4100-B0 | 5.18(ACCL.2.1)C0 and earlier | 5.18(ACCL.2.2)C0 |
| DSL/Ethernet CPE | VMG3625-T50B | 5.50(ABPM.9.8)C0 and earlier | 5.50(ABPM.9.9)C0 |
| DSL/Ethernet CPE | VMG4005-B50A | 5.17(ABQA.3.3)C0 and earlier | 5.17(ABQA.3.4)C0 |
| DSL/Ethernet CPE | VMG4005-B60A | 5.17(ABQA.3.3)C0 and earlier | 5.17(ABQA.3.4)C0 |
| DSL/Ethernet CPE | VMG8623-T50B | 5.50(ABPM.9.8)C0 and earlier | 5.50(ABPM.9.9)C0 |
| Fiber ONT | AM7510-00 | 5.63(ACOR.0.2)C0 and earlier | 5.63(ACOR.0.3)C0 |
| Fiber ONT | AX7501-B1 | 5.17(ABPC.7.2)C0 and earlier | 5.17(ABPC.8)C0 |
| Fiber ONT | PE3301-00 | 5.63(ACMT.3.1)C0 and earlier | 5.63(ACMT.3.2)C0 |
| Fiber ONT | PE5301-01 | 5.63(ACOJ.3.1)C0 and earlier | 5.63(ACOJ.3.2)C0 |
| Fiber ONT | PM3100-T0 | 5.42(ACBF.4.3)C0 and earlier | 5.42(ACBF.4.4)C0 |
| Fiber ONT | PM5100-T0 | 5.42(ACBF.4.3)C0 and earlier | 5.42(ACBF.4.4)C0 |
| Fiber ONT | PM5100-T1 | 5.42(ACBF.4.3)C0 and earlier | 5.42(ACBF.4.4)C0 |
| Fiber ONT | PM7300-T0 | 5.42(ABYY.4.1)C0 and earlier | 5.42(ABYY.4.2)C0 |
| Fiber ONT | PM7500-00 | 5.61(ACKK.1.4)C0 and earlier | 5.61(ACKK.1.5)C0 |
| Fiber ONT | PX5301-T0 | 5.44(ACKB.0.7)C0 and earlier | 5.44(ACKB.0.8)C0 |
| Wireless extender | WE3300-00 | 5.70(ACKA.2)C0 and earlier | 5.70(ACKA.2.1)C0 |
| Wireless extender | WX3100-T0 | 5.50(ABVL.5)C0 and earlier | 5.50(ABVL.5.1)C0 |
| Wireless extender | WX5600-T0 | 5.70(ACEB.6)C0 and earlier | 5.70(ACEB.6.2)C0 |

Zyxel says the table covers affected products still within their vulnerability support period and **excludes ISP-customized models**. It directs ISP customers to their ISP for device-specific firmware and retail customers to Zyxel support. The advisory says to contact Zyxel sales or support to obtain a patch file.

**Provenance:** All 42 model/version/patch rows above come from the July Zyxel vendor advisory. Zyxel's [machine-readable CVE record](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/6xxx/CVE-2026-6952.json) currently names only AX7501-B1 in its structured `affected` field. That record is not the source of this broader table; the two published scopes should remain visibly separate.

## Scope of this advisory

This July advisory addresses **CVE-2026-6952**, the `LogServer` syslog issue. The separate April 2026 Zyxel advisory and other CVEs should not be used as evidence that firmware 5.50(ABVY.7.2)C0 fixes this issue: the July advisory explicitly includes that version in the affected range. In particular, [CVE-2025-13943](https://www.zyxel.com/global/en/support/security-advisories/zyxel-security-advisory-for-null-pointer-dereference-and-command-injection-vulnerabilities-in-certain-4g-lte-5g-nr-cpe-dsl-ethernet-cpe-fiber-onts-security-routers-and-wireless-extenders-02-24-2026) concerns the **log file download** function, a distinct flaw. This note does not establish exploitability on an ISP-customized build or verify that the listed patch works on a particular device.
