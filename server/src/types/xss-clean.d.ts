import { Request, Response, NextFunction } from 'express';

declare module 'xss-clean' {
  function xss(): (req: Request, res: Response, next: NextFunction) => void;
  export = xss;
}