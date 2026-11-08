# Security and disclosure

This is an owner-authorized case study of one EX3301-T0 on official `V5.50(ABVY.7.2)C0`. It is not a vendor advisory or an assertion that every EX3301-T0 firmware version is affected. The observed issue is an authenticated syslog-ng configuration injection, not a defect in the SSH protocol or Dropbear authentication. No cross-reboot persistence was verified.

If you suspect another version is affected, contact the repository owner privately through GitHub before posting a working device-specific exploit. A useful report includes the exact model and firmware build, a sanitized observation, the affected input and output boundary, and whether the original configuration was restored. Please do not place live passwords, session tokens, certificate or SSH host-key fingerprints, serial numbers, MAC addresses, personal IP addresses, complete configuration exports, or firmware dumps in an issue or pull request.

The `tools/` scripts are offline-only models. They do not authenticate to a router, open a socket, change settings, or validate another device. Reproduce live behavior only on equipment you own or are explicitly authorized to test, with a reliable recovery path and the complete original logging object saved privately.
