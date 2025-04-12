import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { AUTH_TYPE_KEY } from 'src/auth/constants/auth.constants';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  > = {
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.None]: { canActivate: () => true }, // wir erstellen einen "Guard" (eigentlich nur ein Objekt) "on the fly", dessen canActivate Methode immer true liefert - weil es die public routes abbildet
  };
  constructor(
    /**
     * Inject Reflector - wird für den Zugriff auf die Metadaten benötigt
     */
    private readonly reflector: Reflector,

    /**
     * Inject AccessTokenGuard - der wird dann verwendet, wenn bei der entsprechenden Route der Auth Dekorator auf Bearer steht
     */
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // authTypes from reflector
    const authTypes = this.reflector.getAllAndOverride(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()], // damit erhält man alle Dekoratoren vom AUTH_TYPE_KEY, die dem Handler oder der Klasse selbst zugewiesen wurden
    ) ?? [AuthenticationGuard.defaultAuthType];

    // array of guards
    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat(); // mit .flat werden enthaltene Arrays flach gedrückt, damit ist guards ein eindimensionales Array mit allen Guards von allen am Request dekorierten AuthTypes
    //console.log('guards', guards);
    const error = new UnauthorizedException();

    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err) => {
        error: err;
      });
      //console.log('canActivate', canActivate);
      if (canActivate) {
        return true;
      }
    }
    // loop thru guards and fire canActivate from the current guard
    throw error;
  }
}
