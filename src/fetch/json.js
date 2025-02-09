export async function fetchJSON(input, init) {
    const result = await fetch(input, init);
    if (result.ok) {
        if (result.status === 204) {
            return;
        }
        return result.json();
    }
    throw new Error(await result.text());
}
