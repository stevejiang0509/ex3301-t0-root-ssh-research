# EX3301-T0: an observed no-UART SSH migration to community OpenWrt

## Result and scope

On **one owner-controlled EX3301-T0**, we reached the current community UBI-based OpenWrt image without opening the case or connecting a 3.3 V serial adapter. The route had **two distinct SSH stages**: official Zyxel `V5.50(ABVY.7.2)C0` to Zyxel-Matrix v17 in slot 1, followed by Matrix to the community UBI image in slot 0. The computer and router were connected by ordinary external Ethernet. Root SSH had already been obtained on C0 through the [separately documented authenticated LogServer case](technical-analysis.md).

This is a device-specific completed migration, **not** a claim that stock C0 can install the community UBI image with a normal `sysupgrade`, nor a universal one-command method for every EX3301-T0 or ISP build. The factory image, NAND geometry, bank hashes, writer and boot-control behavior were checked for this unit before writing. Do not run the private installer or substitute another image or partition name on another device.

## How the published installation paths differ

| Project/image | Published initial-install route | Later upgrade route | What it establishes |
| --- | --- | --- | --- |
| [OpenWrt board-support PR #22945](https://github.com/openwrt/openwrt/pull/22945) and its [image recipe](https://github.com/openwrt/openwrt/blob/main/target/linux/econet/image/en751627.mk) | The merged PR says serial access is required and describes bootloader/TFTP installation of its raw `tclinux.trx` image. | Depends on the installed image/layout. | Its image and bootloader commands are a separate route; they must not be mixed with the later UBI proposal. |
| [Community EX3301-T0 guide](https://openwrt.style.dev/ex3301-t0/) and [OpenWrt PR #25475](https://github.com/openwrt/openwrt/pull/25475) | For the guide's modern UBI image: internal 3.3 V UART to reach the bootloader, plus PC Ethernet/TFTP for first install. | LuCI or shell `sysupgrade` **after** that UBI system is installed. | The guide's supported first-install procedure is serial/TFTP. Its `sysupgrade.bin` is not a documented stock-C0 or Matrix conversion image. PR #25475 was still open when this record was written. |
| [Zyxel-Matrix v17](https://github.com/majad00/Openwrt_Zyxel-EX3301-T0) | Its author documents an OEM web-upgrade route for the **Matrix** image. | Matrix-specific behavior. | The Matrix image is a Zyxel/OpenWrt 15.05-based hybrid, not the modern community UBI image above. |
| This one device | Root SSH on C0 delivered Matrix to the OEM native upgrade watcher; root SSH on Matrix ran a guarded installer for the community UBI factory image. | Not tested here. | A no-internal-UART route was completed on this unit under the preconditions and checks below. |

An Ethernet cable alone is not what the public guide means by its serial/TFTP requirement: the cable carries TFTP data, while internal UART gives bootloader control. Our route used Ethernet for SSH and did **not** use bootloader UART or TFTP.

## Stage 1: official C0 to Matrix v17

The starting system was official `V5.50(ABVY.7.2)C0` with a verified `uid=0` SSH session. The complete upstream Matrix v17 candidate was staged in RAM and checked against the host copy before an atomic rename into the OEM watcher directory, `/var/fw`. The OEM `fwwatcher` handled that event through native request 7. Its observed child command wrote **`tclinux_slave` (`mtd7`, slot 1)**. The normal web-upload RSA compatibility check for this image was false, but native request 7 followed a different legacy validation route: HDR2 magic/header and CRCs, enabled model/FWID checks, and firmware/NAND policy. It would be inaccurate to describe this as broadly disabling the image checks or bypassing all validation.

The router rebooted into the exact Matrix candidate. LuCI and a fresh root SSH login worked. A flash readback matched the candidate payload; the then-retained C0 bank in `tclinux` (`mtd4`, slot 0) had an unchanged full-bank hash. The upstream asset was called v17, while its internal `/etc/openwrt_release` still reported `MATRIX_VER=V-15`; the asset identity and the running metadata are separate observations.

## Stage 2: Matrix to the community UBI image

Matrix was running from **slot 1** with root SSH. A dedicated, device-specific installer checked the community **factory `tclinux.trx`** image hash, board and active-slot state, NAND geometry and bad-block mapping, native writer identity, the retained Matrix bank, and boot-control data. Offline fixtures covered the write barriers before the live preflight. A first read-only live check correctly stopped on a mistyped expected hash; after correction, the exact final script passed read-only preflight before any write.

The stage operation erased and wrote the **inactive slot 0** (`/dev/mtd4`, `tclinux`) and read back the full 40 MiB bank to compare its expected hash. The Matrix bank in slot 1 remained unchanged and the persistent boot flag remained at 1 during this stage. A separate activation step used the OEM boot-control helper to change the flag to 0; a readback showed only the intended flag byte changed. After reboot, the community image ran from slot 0. Two normal boots, root SSH, the LuCI login page, writable UBI overlay, and persistence of the root password and SSH host key were observed. The Matrix slot 1 readback still matched its preinstall hash.

The target factory image had SHA-256 `92bc9aed13765123e8d0887f73df90e11fcc9976caa0712e094e36aa1f606877`; it came from the [community EX3301-T0 build](https://openwrt.style.dev/ex3301-t0/) at source commit `6a4d8afea06221b8cfc78c0ef17300bf17cb65af`. The resulting system reported kernel `6.18.55`, revision `r500+6-53ec2d05a4`, and board `zyxel,ex3301-t0`. It is a community image associated with an open upstream proposal, not a claim that this exact build was an official OpenWrt release.

## Private evidence and remaining limits

The source records below are kept outside GitHub because they include device-specific network and backup details. Their hashes make the claims auditable without publishing credentials, personal addresses, host keys, full configuration exports, proprietary firmware, or raw NAND dumps.

| Private record | SHA-256 | Supports |
| --- | --- | --- |
| `Matrix-v17-SSH-install-attempt.json` | `69088984addda48647bf5fdccea233208dc55f45ecdcb6c404f28d412a79595a` | C0-to-Matrix native request, target slot, checks, boot and readback. |
| `Matrix-UBI-installer-offline-test.json` | `9ea7c1027ba311de70c6f666c8545bcd8746a65b370fc847471c8a280035e22e` | Offline stage/activate fixtures and write barriers. |
| `Matrix-UBI-migration-result.json` | `72ed9507276bd65405a6d8dd21a6d4440e10b3998a27d34e103612050ee2c111` | Slot-0 stage, slot switch, two boots, UBI and retained-Matrix readbacks. |

The installer itself is **not** published as a general-purpose command. It pins the exact image, old-bank hash, NAND geometry, mapping and writer; on another unit those guards must be re-established. A generic Matrix `sysupgrade` was previously rejected as unsafe for this layout. No automatic health-check rollback was proven: retaining Matrix in the other bank is not the same as an automatic recovery guarantee. Wi-Fi data traffic and line-rate performance were not verified on our installed community image. The [upstream UBI proposal](https://github.com/openwrt/openwrt/pull/25475) also identified remaining hardware/performance validation when checked.

For the earlier C0 root-access mechanism and its current-boot limit, see [Technical analysis](technical-analysis.md) and [Evidence and limits](evidence.md). For the vendor's affected-model list, see [Zyxel's advisory scope](official-advisory.md).
