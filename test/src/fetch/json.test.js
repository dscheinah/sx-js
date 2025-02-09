import {fetchJSON} from '../../../src/fetch/json';


test('load 200', async () => {
    const input = 'https://url';
    const init = {method: 'POST', body: 'data'};

    const result = ['result'];

    global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => result,
    });

    expect(await fetchJSON(input, init)).toEqual(result);
    expect(global.fetch).toHaveBeenCalledWith(input, init);
});

test('load 204', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 204,
    });

    expect(await fetchJSON('*')).toBeUndefined();
});

test('load error', async () => {
    const message = 'error message from fetch';

    global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        text: async () => message,
    });

    try {
        await fetchJSON('*');
    } catch (error) {
        expect(error.message).toMatch(message);
    }
});
