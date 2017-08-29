/******************************************************
 * Created by nanyuantingfeng on 12/04/2017.
 *****************************************************/
export default class MessageCenter {

  on (name: string, handler: (...args) => void, context?: any, weight?: number): this;

  once (name: string, handler: (...args) => void, context?: any, weight?: number): this;

  un (name: string, handler?: (...args) => void): this;

  emit (name: string, ...args): this;

  clear (): this

  listenersLength (name: string): number;

  length (name: string): number;

  watch (name: string, handler: (...args) => any, ...args): this

  invoke (name: string, ...args): Promise
}
