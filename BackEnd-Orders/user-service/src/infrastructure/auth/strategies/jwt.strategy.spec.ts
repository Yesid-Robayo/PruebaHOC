import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot()],
            providers: [JwtStrategy],
        }).compile();

        jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('should be defined', () => {
        expect(jwtStrategy).toBeDefined();
    });

    it('should validate and return the payload', async () => {
        const payload = { sub: '12345', email: 'test@example.com' };
        const result = await jwtStrategy.validate(payload);

        expect(result).toEqual({ userId: '12345', email: 'test@example.com' });
    });

  
});