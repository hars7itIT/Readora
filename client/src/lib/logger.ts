export const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[SmallReader:info] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[SmallReader:warn] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[SmallReader:error] ${msg}`, ...args)
};
