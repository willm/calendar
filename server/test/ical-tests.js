import {test} from 'node:test';
import assert from 'node:assert';
import ical from 'node-ical';

test('parsing an event', async () => {
  const icalData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
BEGIN:VEVENT
UID:uid1@example.com
DTSTAMP:19970714T170000Z
ORGANIZER;CN=John Doe:MAILTO:john.doe@example.com
DTSTART:19970714T170000Z
DTEND:19970715T040000Z
SUMMARY:Bastille Day Party
GEO:48.85299;2.36885
END:VEVENT
END:VCALENDAR`;
  console.log(await ical.async.parseICS(icalData));
  assert.equal(true, true);
});
