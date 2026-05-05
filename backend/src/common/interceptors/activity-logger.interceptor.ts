// ============================================================================
// ActivityLoggerInterceptor — Global NestJS interceptor for audit trail
// ============================================================================
//
// Intercepts ALL successful POST, PATCH, and DELETE requests.
// Logging is performed ASYNCHRONOUSLY after the response is sent to the
// client — it does NOT block the HTTP response cycle.
//
// The interceptor uses RxJS `tap()` on the response observable, which means:
//   1. The response is computed and sent to the client.
//   2. The tap() side-effect fires AFTER the response is emitted.
//   3. The DB write runs in a fire-and-forget promise (no await).
//   4. If the log write fails, the error is caught and logged to stderr
//      — it never propagates to the client.
// ============================================================================

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityLog, ActivityAction } from '../entities/activity-log.entity';

/** HTTP methods we care about for audit logging */
const LOGGED_METHODS = new Set(['POST', 'PATCH', 'DELETE']);

/** Map HTTP method → ActivityAction */
function resolveAction(method: string, path: string): ActivityAction {
  if (method === 'DELETE') return ActivityAction.DELETE;
  if (method === 'PATCH' && path.includes('/status')) return ActivityAction.STATUS_CHANGE;
  if (method === 'PATCH') return ActivityAction.UPDATE;
  return ActivityAction.CREATE; // POST
}

/** Extract resource name from route path: /api/v1/risks/:id → "Risk" */
function resolveResourceName(path: string): string {
  const segments = path.replace(/^\/api\/v1\//, '').split('/');
  const raw = segments[0] || 'unknown';
  // Singularize and capitalize: "risks" → "Risk"
  const singular = raw.endsWith('s') ? raw.slice(0, -1) : raw;
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}

@Injectable()
export class ActivityLoggerInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly logRepository: Repository<ActivityLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params } = request;

    // Skip GET/OPTIONS/HEAD — only log mutating operations
    if (!LOGGED_METHODS.has(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode: number = response.statusCode;

          // ── Fire-and-forget async log write ──────────────────────
          // This runs AFTER the response is sent to the client.
          // Errors are caught silently to never impact the response.
          const logEntry = this.logRepository.create({
            action: resolveAction(method, url),
            resourceName: resolveResourceName(url),
            resourceId: params?.id ?? null,
            userId: request.user?.id ?? 'system', // Placeholder until auth is wired
            details: this.sanitizeBody(body),
            httpMethod: method,
            route: url,
            statusCode,
          });

          this.logRepository.save(logEntry).catch((err) => {
            // Silent failure — never block the response
            console.error('[ActivityLogger] Failed to save log entry:', err.message);
          });
        },
      }),
    );
  }

  /**
   * Strip sensitive fields before persisting to the activity log.
   */
  private sanitizeBody(body: Record<string, unknown> | undefined): Record<string, unknown> | null {
    if (!body || typeof body !== 'object') return null;

    const sanitized = { ...body };
    // Remove any password/token fields if they ever appear
    delete sanitized['password'];
    delete sanitized['token'];
    delete sanitized['accessToken'];
    delete sanitized['refreshToken'];

    return sanitized;
  }
}
