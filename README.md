# nmessage-center
MessageCenter


MessageCenter is a It's a universal message center


# Install and test
```bash
# install
npm install nmessage-center
# test
# you will need mocha to run the test
# you can get mocha with (sudo) npm install -g mocha
```

# Example
```javascript

const bus = new MessageCenter()

bus.on("aaa|bbb|ccc", (a,b,c) => {
  //...
})

bus.emit('aaa', 0, 1, 2)


```

#API

MessageCenter::on 

MessageCenter::un

MessageCenter::once 

MessageCenter::emit

MessageCenter::clear

MessageCenter::listenersNumber

MessageCenter::watch

MessageCenter::invoke
