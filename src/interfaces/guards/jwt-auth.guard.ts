import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // Log all headers for debugging
    this.logger.log(`All request headers: ${JSON.stringify(request.headers)}`);
    
    const authHeader = request.headers['authorization'];
    
    this.logger.log(`JwtAuthGuard canActivate called`);
    this.logger.log(`Authorization header: ${authHeader}`);
    this.logger.log(`Request method: ${request.method}`);
    this.logger.log(`Request URL: ${request.url}`);
    this.logger.log(`Request original URL: ${request.originalUrl}`);
    
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log('Route is public, allowing access');
      return true;
    }

    this.logger.log('Route is protected, validating JWT');
    const result = super.canActivate(context);
    this.logger.log(`JWT validation result: ${result}`);
    return result;
  }
}