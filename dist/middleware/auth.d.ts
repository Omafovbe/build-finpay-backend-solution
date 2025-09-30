import { Request, Response, NextFunction } from 'express';
declare const authenticatedToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default authenticatedToken;
//# sourceMappingURL=auth.d.ts.map