import assert from 'node:assert/strict';
import test from 'node:test';
import {exampleLogServer, renderDestination} from './offline-demo.mjs';

test('ordinary address stays inside the destination argument', () => {
  assert.equal(renderDestination('127.0.0.1'),
    'destination d_server{udp("127.0.0.1" port(514) template(t_tem));};');
});

test('observed-length value breaks out into top-level source and log statements', () => {
  assert.equal(Buffer.byteLength(exampleLogServer, 'utf8'), 126);
  assert.ok(!exampleLogServer.includes('\n'));
  const rendered = renderDestination(exampleLogServer);
  assert.match(rendered, /;};source u\{program\("\/usr\/bin\/id/);
  assert.match(rendered, /;};log\{source\(u\);destination\(d_server\);};#/);
  assert.match(rendered, /#" port\(514\) template\(t_tem\)\);};$/);
});
