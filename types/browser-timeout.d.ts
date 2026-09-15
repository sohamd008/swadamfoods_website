export {}

declare global {
  interface Window {
    setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number
    setTimeout(...args: any[]): any
  }
}
