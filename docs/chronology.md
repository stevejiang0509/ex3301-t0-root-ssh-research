# Verified chronology: from stock web access to root SSH

This is the history of **one owner-controlled Zyxel EX3301-T0**. It covers Hyperoptic `V5.50(ABVY.4.1)Y1` and official Zyxel `V5.50(ABVY.7.2)C0`. The original device reports remain private. This document omits the router's address, serial number, MAC address, host keys, credentials, configuration export, and firmware image.

The stages below cross separate boundaries. Showing a menu item, accepting an official image, executing a root command, and obtaining a new root SSH login were **not** the same event.

## 1. Identify and log in to the Y1 device

The computer was connected directly to the router by Ethernet. The first guessed management address was wrong; the active gateway and interface details on the computer identified the actual endpoint. An existing administrator credential then opened the Hyperoptic Y1 web interface. This established authorized web access only. It did not change Linux privileges.

The firmware shown at this stage was `V5.50(ABVY.4.1)Y1`. Device-specific addressing has been omitted so readers must identify their own equipment rather than copy a private address.

## 2. Make the firmware-upgrade page visible

The authenticated account appeared as an Administrator in the web interface but its effective web level was `medium`. The firmware-upgrade page was absent from its visible menu. A narrowly scoped edit appended `Firmware_Upgrade` to that level's `login_privilege` `Page` value. A fresh server-side `MenuList` read then showed the page. The other collected privilege values remained unchanged.

This was a **web-menu permission change**. It neither supplied a Linux root shell nor proved that an arbitrary image would pass firmware checks. The original value was retained for rollback.

## 3. Restrict SSH to the LAN and inspect the initial shell

The SSH management service was set to `LAN_ONLY`; a configuration readback confirmed the mode. The administrator could authenticate over the local Ethernet connection, but the prompt was `ZySH>`, a restricted vendor command interface. This Y1 read-only session did not obtain a Linux root shell.

At this point both image-related checks were still enabled. In the Y1 `ZySH>` session, the read-only commands and recorded responses were:

```text
ZySH> zycli modelcheck show
The modelcheck is enable now. ret:0
ZySH> zycli fwidcheck show
The fwidcheck is enable now. ret:0
```

## 4. Observe the failed C0 upload, then change the checks

An initial upload of the official C0 package through the Y1 interface ended with an “Image uploading failed” dialog. The exact backend subcheck responsible for that first failure was not isolated.

The owner then used the authenticated Y1 `ZySH>` session to turn off the two flags and used `show` to verify the resulting state:

```text
ZySH> zycli modelcheck off
ZySH> zycli fwidcheck off
ZySH> zycli modelcheck show
The modelcheck is disable now. ret:-17
ZySH> zycli fwidcheck show
The fwidcheck is disable now. ret:-17
```

The `ret:-17` text is the recorded response accompanying “disable now”; it is not evidence that the checks remained enabled. These flags are distinct from RSA signature verification. The records do **not** establish that they remain off after reboot, that turning them off alone caused the later upload to succeed, or that this procedure accepts an unsigned or unrelated image. See [Firmware check commands](firmware-checks.md) for the focused record and limits.

## 5. Install and verify the official C0 image

After those readbacks, one official `V5.50(ABVY.7.2)C0` image upload was performed. The router rebooted. Its web interface reported the C0 version, the original administrator credential still worked, and local SSH login remained available with `LAN_ONLY` management scope. The uploaded `.bin` image extracted from the official package had SHA-256 `1958230af33f46879f592f90fbd5cea0e16a51d5c352fa3c9560cb832df472bc` in the original record.

This is a verified sequence on one device, not a general downgrade, cross-variant flashing, or signature-bypass method. The C0 image was the vendor's official package. Installation did not itself yield a root shell.

## 6. Establish the C0 privilege baseline

On official 7.2C0, the administrator's LAN SSH login still entered `ZySH>`. A direct `root` login using the existing administrator credential failed, and a plain `sh` command was rejected. Read-only CLI inspection did not produce a Linux UID of zero. Static review of the vendor CLI and account-management paths indicated that the ordinary `medium` account did not have a supported self-promotion path to the vendor's `high` management level. These findings prompted a separate investigation of the logging configuration path; they do not prove that every possible management path was inaccessible.

## 7. Trace the authenticated logging path offline

Static analysis of the extracted 7.2C0 firmware traced an authenticated `PUT /cgi-bin/DAL?oid=logset` request. In remote logging modes, the `LogServer` value flowed through DAL/RDM into a generated syslog-ng destination line without suitable configuration-language escaping. The firmware included syslog-ng's `program()` source driver, which can launch a program through `/bin/sh -c`.

The observed weakness was **syslog-ng configuration injection**, not an SSH daemon bug and not direct concatenation of `LogServer` into the shell command that starts syslog-ng. Static analysis alone did not prove that a live router would accept and execute a particular input.

## 8. Prove temporary root execution and restore logging

Using an authenticated management session, the owner temporarily changed only the relevant logging mode and `LogServer` value. A separate, pinned LAN SSH session with a PTY observed the test command's output:

```text
uid=0(root) gid=0(root)
```

That observation proved a root process executed on this C0 device. It was **not yet** an interactive root SSH login. The local probe's own status file did not capture the UID, so the independent SSH observation is the runtime proof.

The logging configuration was restored with two ordered authenticated writes. While still in a remote-capable mode, `LogServer` was cleared to its original value and read back. The original `Local` mode was then restored, and the entire original `logset` object was compared. This order matters because the analyzed DAL ignores `LogServer` updates while the effective mode is `Local`. No firmware partition or boot slot was changed by this proof.

## 9. Promote the runtime account and verify a new SSH session

The temporary root execution channel was subsequently used to prepare a copy of the runtime password file in RAM. The original file was backed up before promotion. Only the `admin` record's UID and GID changed from `21:21` to `0:0`, and its login shell changed from `/usr/bin/zysh` to `/bin/sh`. Its password field, home, and descriptive fields remained unchanged; all other accounts were byte-identical. The prepared copy replaced the active runtime file, preserving its observed ownership and mode.

A **new** SSH login with the original administrator credential succeeded. That session reported `uid=0(root) gid=0(root)`, and a separate SSH execution of `id -u` returned `0` with exit code zero. This proves a full root SSH shell for the **current boot**. The logging configuration was fully restored after each temporary root action.

The account file was runtime state: `/etc/passwd` linked to `/tmp/var/passwd`. No startup persistence was installed. Vendor account regeneration or a reboot may replace that file, so persistence across reboot has **not** been established.

## 10. Later root-password check, outside the exploit chain

A later interactive use of the native `passwd` command changed the runtime root password and a fresh root SSH login succeeded. The OEM account shadow was not synchronized and reboot persistence was not tested. This follow-up was not required to discover the injection or prove the administrator's current-boot root SSH access. No password or hash is published here.

## What this establishes

The strongest demonstrated outcome is Linux `uid=0` command execution and a fresh, interactive root SSH session on **one** EX3301-T0 running official 7.2C0. It does not establish an unauthenticated attack, WAN reachability, a vulnerability in SSH itself, permanent root access, or applicability to every Y1/C0 unit or later firmware.
