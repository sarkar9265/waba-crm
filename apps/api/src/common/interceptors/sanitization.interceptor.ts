import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { filterXSS } from 'xss';

@Injectable()
export class SanitizationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.body) {
      request.body = this.sanitizeObject(request.body);
    }
    
    if (request.query) {
      for (const key of Object.keys(request.query)) {
        request.query[key] = this.sanitizeObject(request.query[key]);
      }
    }

    if (request.params) {
      for (const key of Object.keys(request.params)) {
        request.params[key] = this.sanitizeObject(request.params[key]);
      }
    }

    return next.handle();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return filterXSS(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
      const sanitizedObj: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitizedObj[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitizedObj;
    }

    return obj;
  }
}
