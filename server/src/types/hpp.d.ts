import { Request, Response, NextFunction } from 'express';

declare module 'hpp' {
  interface Options {
    checkQuery?: boolean;
    checkBody?: boolean;
    checkBodyOnlyForContentType?: string;
    whitelist?: string | string[];
  }
  function hpp(options?: Options): (req: Request, res: Response, next: NextFunction) => void;
  export = hpp;
}