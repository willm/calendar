export async function addCalendar(link) {
  const res = await fetch('http://localhost:3000/calendar', {
    method: 'post',
    body: JSON.stringify({link}),
  });
  return await res.json();
}
