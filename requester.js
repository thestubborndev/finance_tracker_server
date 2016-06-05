const fetch = require('node-fetch');

const requester = {
    async getRequestAsync(url) {
        const response = await fetch(url);
        if (!response.ok) {
            const err = new Error(`Non-200 Response Received: ${response.status}`, response);
            err.response = response;
            throw err;
        } else {
            return await response.json();
        }
    }
};

module.exports = requester;
