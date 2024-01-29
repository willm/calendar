import {Events} from './model';

export async function addCalendar(link: string): Promise<Events> {
  const res = await fetch('http://localhost:3000/calendar', {
    method: 'POST',
    body: JSON.stringify({link}),
  });
  return await res.json();
}
