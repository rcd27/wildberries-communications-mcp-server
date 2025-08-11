import dotenv from 'dotenv';
import { getSupplierValuations } from '../getSupplierValuations.js';

dotenv.config();

describe('getSupplierValuations integration test', () => {
  const apiKey = process.env.WB_COMMUNICATIONS_OAUTH_TOKEN;

  beforeAll(() => {
    if (!apiKey) {
      throw new Error('WB_COMMUNICATIONS_OAUTH_TOKEN env var is not set');
    }
  });

  it('Should return list of supplier valuations', async () => {
    const response = await getSupplierValuations('ru', apiKey as string);
    expect(response.error).toBe(false);
    expect(response.errorText).toBe('');
    expect(response.data).toBeDefined();
  })
});