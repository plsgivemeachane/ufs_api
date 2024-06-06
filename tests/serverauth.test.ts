import { getUsernameAndPasswordPair } from "../utils";

describe('getUsername', () => {
    it('should return a non-null string', async () => {
        const username = await getUsernameAndPasswordPair();
        expect(username).toBeTruthy();
        expect(typeof username).toBe('string');
    });
});