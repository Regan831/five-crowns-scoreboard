declare module "@prisma/client" {
  export class PrismaClient {
    constructor(...args: any[]);
    $transaction: any;
    [key: string]: any;
  }
  export const Prisma: any;
}
