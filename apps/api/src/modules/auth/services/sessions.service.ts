import { Injectable, NotImplementedException } from '@nestjs/common';
import { SessionResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';
import { TenantContext } from '../../../common/interfaces';
import { AuthenticatedUser } from '../../../common/interfaces';

@Injectable()
export class SessionsService {
  findAll(
    _tenant: TenantContext,
    _user: AuthenticatedUser,
    _query: FilterPaginationDto,
  ): Promise<SessionResponseDto[]> {
    throw new NotImplementedException('findAll sessions');
  }

  terminate(_tenant: TenantContext, _user: AuthenticatedUser, _sessionId: string): Promise<void> {
    throw new NotImplementedException('terminate session');
  }
}
