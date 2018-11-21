describe('calendar', () => {
    it('loads', async () => {
        await browser.url(process.env.TEST_SERVER_URL);

        expect(await browser.getTitle()).toBe('Spot');
    });
});
