# Evidence ledger and claim boundaries

The findings in this repository come from one owner-controlled Zyxel EX3301-T0, offline analysis of its official `V5.50(ABVY.7.2)C0` image, and bounded live observations. This page distinguishes **what was directly observed** from **what the observations suggest**. The original reports contain device-specific information and are deliberately not published.

## Vendor context and source boundary

Zyxel's [21 July 2026 advisory](https://www.zyxel.com/global/en/support/security-advisories/zyxel-security-advisory-for-post-authentication-command-injection-vulnerability-in-certain-dsl-ethernet-cpe-fiber-onts-and-wireless-extenders-07-21-2026) identifies CVE-2026-6952 as command injection in the syslog `LogServer` field. Its 42-model affected-products table includes EX3301-T0 firmware `5.50(ABVY.8)C0` and earlier and names `5.50(ABVY.8.1)C0` as the patch. Zyxel says the table covers products within its vulnerability support period and excludes ISP-customized models. The repository's [advisory summary](official-advisory.md) transcribes that table.

The [Zyxel-authored CVE JSON record](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/6xxx/CVE-2026-6952.json) describes the same `LogServer` issue but its structured `affected` array lists only AX7501-B1 firmware. It links to the broader vendor advisory; the array should not be presented as the advisory's complete product list. Neither official source discloses the syslog-ng configuration path or root UID. Those narrower claims rest on the 7.2C0 firmware analysis and the one-device observation recorded below.

## Core claim and proof chain

| Claim | Evidence type | What the record actually establishes |
| --- | --- | --- |
| Y1 administrator could access the upgrade page | Authenticated write plus fresh readback | `Firmware_Upgrade` was added to the `medium` role's web `Page` list and then appeared in `MenuList`. This was a menu permission, not Linux root. |
| SSH was limited to the LAN | Configuration write plus fresh readback | The SSH management service mode was `LAN_ONLY`; the later C0 post-upgrade check also reported LAN-only scope. This does not establish the state of every other service. |
| The Y1 checks were toggled | Authenticated `ZySH>` commands plus `show` output | Both `modelcheck` and `fwidcheck` were initially enabled; `off` was recorded and both later readbacks said `disable now`. The records do not isolate the reason the first image upload failed. |
| Official C0 installed | Device reboot plus version/login readback | Following one official image upload, the web UI reported `V5.50(ABVY.7.2)C0`, and the original administrator could log in through web and local SSH. This does not prove unsigned images can be installed. |
| Ordinary admin SSH was restricted | Live login attempts | `admin` entered `ZySH>`; the existing administrator credential did not directly log in as `root`. No root shell was obtained through the ordinary CLI checks. |
| `LogServer` reached executable configuration syntax | Firmware static analysis | The authenticated DAL/RDM path placed the value into a syslog-ng `udp("%s" ...)` line without a field-specific configuration-language escape on the analyzed path. The image also contained a `program()` driver that uses `/bin/sh -c`. Static analysis alone is not live execution proof. |
| A command ran with UID 0 | Independent SSH PTY observation | During a temporary authenticated logging change on 7.2C0, `id` output was observed as `uid=0(root) gid=0(root)`. The local probe status file did not itself capture the UID. Original log settings were restored and compared in full. |
| A fresh root SSH session worked | New SSH login plus separate command | The runtime `admin` UID/GID and shell were changed; a new SSH session reported root and an independent `id -u` returned `0`. Only the **current boot** was verified. |

The exploit path is **authenticated `LogServer` → syslog-ng configuration injection → root command execution → modification of a runtime account file → fresh root SSH**. It is not an SSH protocol flaw, a Dropbear authentication bypass, or evidence of an unauthenticated web exploit.

## Private source record index

The SHA-256 values below identify the exact private source reports used in this write-up. They are **hashes of records**, not router credentials or hashes of password fields. Filenames are listed to make the claim trail auditable by the device owner; the source files themselves are not in the GitHub repository.

| Private record filename | SHA-256 | Supported observation |
| --- | --- | --- |
| `menu-result-live.json` | `dc828d4d4467472751fc45da7c40e1624a2f15d01111595518a9c265246fca01` | `medium` web menu change and readback on Y1. |
| `router-ssh-LAN-result.json` | `dbdf32c2d0ba4c173497736633b121bad71997ed9af23fea1c839d4a3ad2de12` | SSH management mode changed to and read back as `LAN_ONLY`. |
| `router-ssh-command-check.json` | `50732370ef88b966e0f7a311a15b975fafb71a9102d92b3c60b5798cce160d8f` | Y1 `ZySH>` baseline and both firmware check flags initially enabled. |
| `EX3301-T0-firmware-compatibility.json` | `c718aff946799d10de416a4eba7c7e5eb98de382ed18fa336ec499db58a118e7` | Recorded `zycli modelcheck off` and `zycli fwidcheck off` actions. |
| `C0-after-checks-off-result.json` | `faaccec05451bbd83b4628a53a5b281740b39a5c8f5670dad8ee60cb4336a3c3` | Disabled-state readbacks, official C0 upload, reboot, version, and login checks. |
| `zycli-command-table.json` | `09d8f47f5472f18e0f753bb217f14309e22069e0f348ae8d30a0ef14f8ae10b2` | Extracted C0 vendor command help, including the runtime-only note. This is not a live Y1 permission test. |
| `C0-SSH-root-access-check.json` | `732c9c0e2a8014133f5c96aaff434ce52139794f9cb9ec1c4251b7327b868ebd` | C0 restricted administrator shell and failed direct root login with existing credentials. |
| `C0-logserver-static-analysis.md` | `646b2be8dea51e23989f98c885c9e0ec2358b117bde1bd1da8a529d1a1840e5f` | Static `LogServer` data flow, syslog-ng format strings, program driver, and restoration order. |
| `C0-root-uid-proof.json` | `74bb12bc8865181c4f84e55a0ac357a2e697e7a41b7ec2058e7f282611bc5eee` | Independent SSH PTY root UID observation and full log-setting restoration. |
| `C0-admin-root-SSH-result.json` | `3b7663ae50106e4ead0f2c33d8dee47a3ca81017b403fd1e9061be353563d7c8` | Minimal runtime `admin` account change, fresh SSH UID 0, and current-boot limitation. |
| `C0-root-password-change-result.json` | `6cd9dcc1c62451e5da1eb3c872632bd1ba03ef1b623cf0d3ab7e860b067d950a` | Optional later runtime root-password change and fresh login; no reboot-persistence proof. |

The uploaded `.bin` image extracted from the official C0 package was recorded separately with SHA-256 `1958230af33f46879f592f90fbd5cea0e16a51d5c352fa3c9560cb832df472bc`. The enclosing ZIP has a different hash. Neither the package nor extracted proprietary binaries are distributed here.

## Why the restoration result matters

On the analyzed C0 path, `LogServer` is ignored when the effective `LogMode` is `Local`. A one-step write of both the original local mode and original server value may therefore leave the injected server field stored. The original test first cleared `LogServer` while the mode was remote-capable, verified that readback, then restored the original mode and compared the full `logset` object. Each write may regenerate the configuration and restart logging services.

The proof value worked even with the original log `Enable` set to false because the injected syntax supplied its **own** `source` and `log` route. The ordinary category-routing loop gated by `Enable` was not the only route in the generated configuration. That statement is specific to the analyzed sample and the observed live proof.

## Conclusions not supported by these records

- They do not demonstrate that an anonymous user, WAN-side user, or an account with only restricted SSH menu access can trigger the logging path.
- They do not establish a vulnerability in the SSH daemon or the SSH protocol. SSH was used as an observation and later login channel.
- They do not show that disabling `modelcheck` and `fwidcheck` bypasses RSA signature verification, accepts arbitrary firmware, or remains in effect after reboot.
- They do not establish that the runtime `admin` root SSH change or later root-password change survives a reboot or OEM account regeneration.
- They do not establish the vulnerability's status on other hardware batches, firmware versions, or any already-patched release.
- They do not imply that every step in the historical Y1-to-C0 migration is required to test the logging issue on a device already running the examined C0 image.

The repository excludes the original configuration backups, host keys, credentials, serial numbers, per-device network details, and proprietary firmware binaries. The offline demo models one string expansion; it does not contact a router or substitute for the live evidence above.
