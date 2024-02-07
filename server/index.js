import http from 'http';
import ical from 'node-ical';

http
  .createServer((req, res) => {
    console.log(req.url);
    if (req.method === 'OPTIONS') {
      console.log('foo');
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      });
      res.end('');
    }
    if (req.url === '/calendar' && req.method === 'POST') {
      let data = '';
      req.on('data', (d) => (data += d.toString('utf8')));
      req.on('end', async () => {
        const {link} = JSON.parse(data);
        const iCallBody = await ical.async.fromURL(link);
        console.dir(iCallBody);
        const mapped = Object.entries(iCallBody)
          .filter(([_, event]) => {
            //return event.type === 'VEVENT';
            return event.start;
          })
          .map(([uid, event]) => {
            return {
              uid,
              summary: event.summary,
              timestamp: event.start.valueOf(),
              start: event.start,
              end: event.end,
            };
          });
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'access-control-allow-origin': '*',
        });
        res.end(JSON.stringify({events: mapped}));
      });
    }
  })
  .listen(3000);
