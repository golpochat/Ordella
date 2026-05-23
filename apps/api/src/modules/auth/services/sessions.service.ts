import { Injectable, NotImplementedException } from '@nestjs/common';
import { SessionResponseDto } from '../dto/sessions/session-response.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class SessionsService {
  findAll(
    _tenant: TenantContext,
    _user: AuthenticatedUser,
    _query: PaginationQueryDto,
  ): Promise<SessionResponseDto[]> {
    throw new NotImplementedException('findAll sessions');
  }

  terminate(_tenant: TenantContext, _user: AuthenticatedUser, _sessionId: string): Promise<void> {
    throw new NotImplementedException('terminate session');
  }
}
