export default class MessageCenter {
    private __handlers;
    private __events;
    private readonly __maxListeners;
    private __watchHandlersMap;
    private __addHandler(name, handler, context, weight);
    private __getHandlers(name);
    private __getHandlerIndex(name, handler);
    private __achieveMaxListener(name);
    private __handlerIsExists(name, handler, context);
    private __on(name, handler, context?, weight?);
    private __un(name, handler?);
    private __emit(name, ...args);
    private __setHandlerInMap(handler, realHandler);
    private __getHandlerInMap(handler);
    constructor(maxListeners?: number | string | null);
    has(name: string): boolean;
    on(name: string, handler: Function, context?: any, weight?: number): this;
    once(name: string, handler: Function, context?: any, weight?: number): this;
    un(name: string, handler?: Function): this;
    emit(name: string, ...args: any[]): this;
    clear(): this;
    listenersLength(name: string): number;
    watch(name: string, handler: Function, context?: any): this;
    invoke(name: string, ...args: any[]): Promise<any>;
}
