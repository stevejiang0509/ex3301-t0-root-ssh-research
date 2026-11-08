# Disabling the Y1 firmware ID and model checks

This page records the command sequence observed on **one owner-controlled Zyxel EX3301-T0 running Hyperoptic `V5.50(ABVY.4.1)Y1`** before the official `V5.50(ABVY.7.2)C0` upload. It is a historical account of that device, not a claim that other ISP variants or firmware images are compatible.

## Prerequisites and command context

The owner connected a computer to the router's trusted LAN, enabled SSH management for LAN only, and authenticated as the existing `admin` account. The SSH prompt was `ZySH>`, the vendor's restricted command interface, rather than a Linux root shell. Replace the placeholder below with the LAN address of your own device and verify its SSH host key before entering credentials:

```text
ssh admin@<ROUTER_LAN_IP>
ZySH>
```

The commands below were entered **at `ZySH>`**, with `zycli` at the start of each command. Do not include the prompt text when typing.

## 1. Read the original state

The original Y1 session recorded these exact responses:

```text
ZySH> zycli modelcheck show
The modelcheck is enable now. ret:0

ZySH> zycli fwidcheck show
The fwidcheck is enable now. ret:0
```

`modelcheck` controls the model-bit runtime check used during firmware upgrades; `fwidcheck` controls the firmware-ID runtime check. Both were enabled before the change.

## 2. Turn off the two checks

The recorded authenticated action used these commands:

```text
ZySH> zycli modelcheck off
ZySH> zycli fwidcheck off
```

The original record does not preserve a separate response body for each `off` command. The state was checked again **before** uploading the official C0 image:

```text
ZySH> zycli modelcheck show
The modelcheck is disable now. ret:-17

ZySH> zycli fwidcheck show
The fwidcheck is disable now. ret:-17
```

The wording `disable now` is the observed status indicator. Do not treat the numeric `ret:-17` alone as proof of success; confirm the complete response from your own device. If an option is absent, rejected, or gives a different result, stop rather than guessing an alternate command.

## 3. What happened next

An earlier Y1 upload had displayed “Image uploading failed.” After both checks reported disabled, **one** retry with the official EX3301-T0 `V5.50(ABVY.7.2)C0` image was submitted. That specific device restarted into 7.2C0; the version shown by the web interface, the original administrator login, and LAN-only SSH access were verified. The image file used in the record had SHA-256 `1958230af33f46879f592f90fbd5cea0e16a51d5c352fa3c9560cb832df472bc`.

This sequence establishes the result on one device. It does **not** isolate which backend sub-check caused the earlier failure, prove that disabling just one option would suffice, or establish compatibility with a different image. The model/FWID runtime checks are separate from the 7.2C0 RSA image-signature validation; the observed commands did not disable RSA signature verification.

## Persistence and reversal boundary

The extracted vendor command table describes both command families with `#Not support save to flash#`. This is evidence that they are intended as runtime settings, **not** evidence that any particular Y1 setting survives or resets on reboot. After the C0 upgrade, `zycli modelcheck show` and `zycli fwidcheck show` returned to the `ZySH>` prompt without a status line, so their state on the new build was not established.

The vendor command table also advertises `zycli modelcheck on` and `zycli fwidcheck on` as the reverse options. The research record did not perform or verify those `on` commands on Y1. If you are aborting before any upgrade, use only commands actually supported by your current firmware and confirm each resulting `show` response. A reboot, firmware change, or successful command return must not be substituted for read-back verification.

## Evidence retained outside this repository

- `router-ssh-command-check.json`: Y1 `ZySH>` prompt and both original `show` responses.
- `EX3301-T0-firmware-compatibility.json`: recorded authenticated `off` actions and the official-image result.
- `C0-after-checks-off-result.json`: disabled `show` responses immediately before the single retry and the post-upgrade verification.
- `zycli-command-table.json`: extracted vendor command help and runtime-only note. This table was analyzed from the later official C0 firmware; its command help must not be treated as a live Y1 authorization test.

These private originals are indexed by hash in [Evidence and limits](evidence.md); they are not published because they contain device-specific information.
