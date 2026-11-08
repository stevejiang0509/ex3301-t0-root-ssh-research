# Reproducing the observations and restoring state

This is a record of a completed, owner-authorized investigation on **one** EX3301-T0. It distinguishes the Y1-to-C0 firmware transition, temporary root command execution, and a later root SSH login. It is not a universal firmware upgrade procedure. The included JavaScript demo runs entirely offline; this repository does not distribute a credential-handling or device-writing client.

## 1. Identify the device and establish bounded access

1. Connect a computer directly to a LAN port by Ethernet. Determine the management address from the computer's gateway and ARP information instead of assuming that an address found in an earlier session still belongs to this router.
2. Check the displayed model and exact firmware version. The observed starting point was EX3301-T0 on Hyperoptic `V5.50(ABVY.4.1)Y1`.
3. Authenticate with the owner's web administrator account. Its web role was `medium`; this is separate from Linux UID and SSH shell privileges.
4. If the firmware page is absent, record the original `login_privilege` object before changing it. In this case, the role's `Page` string gained the `Firmware_Upgrade` ID while its other selected fields were preserved. A fresh `MenuList` readback showed the page. This only exposed web navigation; it did not make an image compatible or remove signature validation.
5. Set the SSH management service to `Mode=LAN_ONLY`, then read the service configuration back. Do not infer a LAN restriction merely from a successful local login. The original record showed `LAN_ONLY` and enabled port 22 after the change.

The original web login and DAL writes used the firmware's encrypted request envelope and session token. A plain unauthenticated JSON `PUT` is not equivalent to the browser's protocol. The repository omits live login code because it would need device-specific pins, credentials, and recovery handling.

## 2. Disable the two Y1 runtime firmware checks

The verified Y1 SSH session entered `ZySH>`, not a Linux shell. From this prompt, the owner used `zycli modelcheck off` and `zycli fwidcheck off`, with `show` before and after. The [firmware check command page](firmware-checks.md) gives the exact transcript and source boundaries; the short version is:

```text
ZySH> zycli modelcheck off
ZySH> zycli fwidcheck off
ZySH> zycli modelcheck show
The modelcheck is disable now. ret:-17
ZySH> zycli fwidcheck show
The fwidcheck is disable now. ret:-17
```

The disabled-state text is the observed Y1 `show` response. The extracted **C0** command table describes runtime checks and says the switches are not saved to flash; it is static command help, not a Y1 reboot test. Their post-reboot state was not established. These controls are distinct from the C0 RSA image signature check and do not justify flashing an unsigned or mismatched image.

After recording the checks, the owner uploaded an official `V5.50(ABVY.7.2)C0` image once through the revealed web page. The first Y1 upload attempt, before this change, had failed; its exact backend rejection subcheck was never proven. On reboot the web UI displayed 7.2C0, the original administrator logged in, and LAN-only SSH worked. This observed sequence is evidence for this device and image, not a guarantee for another unit.

## 3. Establish the C0 starting privilege

On C0, `admin` still entered `ZySH>`. The existing administrator credential did not log in as `root`, and a shell command typed into ZySH was rejected. This matters: the later root proof did not start with a root SSH login.

The firmware used for static analysis had SHA-256 `1958230af33f46879f592f90fbd5cea0e16a51d5c352fa3c9560cb832df472bc`. The [technical analysis](technical-analysis.md) traces the authenticated `LogServer` value through DAL/RDM to a syslog-ng configuration string. The offline model can be run with:

```sh
npm test
npm run demo
```

Its example value is 126 bytes and illustrates a break out of `udp("%s" ...)` into a top-level `source` and `log` route. This local string expansion does not establish live execution by itself.

## 4. Prepare a logset baseline before any live probe

1. Read the **complete** authenticated `GET /cgi-bin/DAL?oid=logset` object, and store a private recovery copy outside this repository.
2. Confirm the device model, firmware, administrator role, management connection, SSH PTY, and an independent recovery path. Do not substitute a screenshot or a partial field list for the original object.
3. Record `Enable`, `LogMode`, `LogServer`, TLS mode, port, and all remaining fields. This device's original critical values were `Enable=false`, `LogMode=Local`, `LogServer=0.0.0.0`, TLS off, and UDP port 514. Other devices may differ.
4. Remember that a logset write regenerates syslog-ng configuration and restarts logging services. Even a read-only UID command inside the injected program is not a read-only router operation.

At this stage the normal `ZySH>` session did **not** have a Linux account-file backup route. The runtime account-file backup was made later, after the temporary root channel was proven and before any account modification.

## 5. Distinguish temporary root execution from SSH root access

The bounded live probe changed only `LogMode` and `LogServer`, then read them back. The injected syntax supplied its own syslog-ng `source` and `log` statements, so the original `Enable=false` category gate did not prevent this proof. An independent LAN SSH PTY showed:

```text
uid=0(root) gid=0(root)
```

That observation proves a root process ran on this C0 device. It does **not** yet prove an interactive root SSH shell. The probe's own status file did not capture the UID; the separate SSH observation was the runtime proof. The temporary log configuration was then restored as described next, without a firmware flash or boot-slot change.

## 6. Restore `LogServer` in two ordered writes

The analyzed DAL skips `LogServer` updates when the effective mode is `Local`. Consequently, combining `LogMode=Local` and the original `LogServer` in one request does not reliably clear the injected string.

1. While the effective mode is `LocalRemote` or `Remote`, set `LogServer` back to its saved original value. Read the object and verify the field was actually cleared.
2. Set `LogMode` back to its saved original value. Read the **entire** object and compare it with the pre-probe backup, including fields not explicitly edited.

Both writes can restart the logging service. An HTTP success response alone is insufficient. If a write or readback fails, stop further steps and use the prepared recovery path. The original owner session reported all original logset fields equal after restoration.

## 7. Promote the runtime account and verify a new SSH session

Only after root execution was established did the investigation prepare a backup of the runtime account file. On this C0 system `/etc/passwd` pointed to `/tmp/var/passwd`. The temporary root channel made a working copy and changed **only** `admin` from UID/GID `21/21` to `0/0` and its shell from `/usr/bin/zysh` to `/bin/sh`. The password field, GECOS/home fields, ownership/mode, and all other account entries were checked unchanged.

This account edit was performed through the temporary root command channel; the commands were **not** accepted by the initial `ZySH>` prompt. A fresh password-based SSH login then showed `uid=0(root) gid=0(root)`, and an independent SSH `id -u` returned `0` with exit code 0. The change was to a runtime file, so a reboot or OEM account regeneration may undo it. No persistent startup hook was installed or verified.

The later change to the root password was a separate runtime action, not a prerequisite for this exploit chain. Its new SSH login worked during the same boot, but survival across a reboot was not tested.

## What a new verification report should contain

Record the exact model and firmware hash, authenticated preconditions, sanitized pre/post logset fields, the independent UID observation, two-step restoration and full-object comparison, the minimal runtime account diff, a fresh SSH UID result, and whether the router rebooted. Do not publish credentials, session data, host keys, device identifiers, private IPs, full configuration exports, or raw firmware dumps.
