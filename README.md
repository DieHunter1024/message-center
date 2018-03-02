# MessageCenter 一个简易的消息中心



# Install and test
```bash
# install
npm install message-center.js

```

# Example
```javascript

const messageCenter = new MessageCenter()

messageCenter.on("aaa|bbb|ccc", (a,b,c) => {
  //...
})

messageCenter.emit('aaa', 0, 1, 2)

messageCenter.un('aaa')

```

# API

### on(eventName, handler, context?, weight?)
> 为指定事件注册一个监听器，接受一个字符串 eventName 和一个 回调函数。
```javascript

messageCenter.on('aaa|bbb|ccc', () => {
  //do something
});

// 等价于
     messageCenter.on('aaa', () => {
       //do something
     });
     
     messageCenter.on('bbb', () => {
       //do something
     });
     
     messageCenter.on('ccc', () => {
       //do something
     });


```
 
### once(eventName, handler, context?, weight?)
> 为指定事件注册一个单次监听器,监听器最多只会触发一次,触发后立刻解除该监听器。
 

### emit(eventName, ...args)  
> 按参数的顺序执行每个监听器

### un(eventName, handler?)
> 解除监听器 如没有传入handler,将会解除eventName名下所有监听器

### clear()
> 重置 messageCenter

### listenersCount(eventName) 
> 计算监听器的数量

### watch(eventName, handler, ...args)
> 与invoke方法一起使用, 能够返回watch方法的handler可以收到invoke方法的计算结果
> 同时invoke也能够收到watch方法的返回结果
 
### invoke(eventName, ...args)

```javascript
    const messageCenter = new MessageCenter()
    
    messageCenter.watch("aaa", (a,b,c) => {
      // a === 0
      // b === 1
      // c === 2
      return { a: 2, b: 3, c: 4}
    })
    
    messageCenter.invoke('aaa', 0, 1, 2).then(data => {
      // data === { a: 2, b: 3, c: 4}
    })

```
 
