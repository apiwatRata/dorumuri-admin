import { login } from '../src/controllers/authController';
import userService from '../src/services/userService';

jest.mock('../src/factory/userFactory');

describe('Authentication Unit Test', () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully with correct credentials', async () => {
    const mockUser = { username: 'john', password: 'secretpassword' };
    
    userService.findByUsername.mockResolvedValue(mockUser);

    const result = await login('john', 'secretpassword');12

    expect(result.success).toBe(true);
    expect(result.token).toBe('mock-jwt-token');
    expect(userService.findByUsername).toHaveBeenCalledWith('john');
  });

  it('should return failure when password is incorrect', async () => {
    const mockUser = { username: 'john', password: 'secretpassword' };
    userService.findByUsername.mockResolvedValue(mockUser);

    const result = await login('john', 'wrongpassword');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
  });

  it('should return failure when user does not exist', async () => {
    userService.findByUsername.mockResolvedValue(null);

    const result = await login('unknownuser', 'anypassword');

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
  });

  it('should throw an error if username or password is missing', async () => {
    await expect(login('', 'secretpassword')).rejects.toThrow('Username and password are required');
    await expect(login('john', '')).rejects.toThrow('Username and password are required');
  });
  
});
