import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// Códigos ANSI para colores en consola
const reset = '\x1b[0m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';
const red = '\x1b[31m';
const cyan = '\x1b[36m';
const gray = '\x1b[90m';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;

    const time = new Date().toLocaleTimeString();
    const start = Date.now();

    res.on('finish', () => {
      const ms = Date.now() - start;
      const status = res.statusCode;

      let methodColor = cyan;
      if (method === 'GET') methodColor = green;
      if (method === 'POST') methodColor = blue;
      if (method === 'PUT') methodColor = yellow;
      if (method === 'DELETE') methodColor = red;

      let statusColor = green;
      if (status >= 300 && status < 400) statusColor = cyan;
      if (status >= 400 && status < 500) statusColor = yellow;
      if (status >= 500) statusColor = red;

      console.log(
        `${gray}[${time}]${reset} ` +
          `${methodColor}${method.padEnd(7)}${reset} ` +
          `${originalUrl} ${statusColor}${status}${reset} ${ms}ms` +
          ` — IP: ${ip}`,
      );
    });
    next();
  }
}
