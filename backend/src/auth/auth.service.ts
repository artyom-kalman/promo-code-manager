import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    return this.generateTokens(user._id.toString(), user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.hashedPassword,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user._id.toString(), user.email);
  }

  async refresh(dto: RefreshDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        type: string;
      }>(dto.refreshToken);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    return {
      accessToken: this.jwtService.sign(
        { ...payload, type: 'access' },
        { expiresIn: '15m' },
      ),
      refreshToken: this.jwtService.sign(
        { ...payload, type: 'refresh' },
        { expiresIn: '7d' },
      ),
    };
  }
}
