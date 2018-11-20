describe('calendar', () => {
    it('loads', async () => {
        await browser.url(process.env.URL);

        expect(await browser.getTitle()).toBe('Spot');
    });
});
