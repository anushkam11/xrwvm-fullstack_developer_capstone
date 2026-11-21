export async function api(path, data) {
  const csrfToken = document.cookie.split('; ').find(cookie => cookie.startsWith('csrftoken='))?.slice(10);
  const options = data === undefined ? {} : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken || '' },
    body: JSON.stringify(data),
  };
  const response = await fetch('/djangoapp/' + path, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}
