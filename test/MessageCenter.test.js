/**************************************************
 * Created by nanyuantingfeng on 10/03/2017 16:39.
 **************************************************/
import MessageCenter from '../src/MessageCenter'

test('on/emit', () => {

  const bus = new MessageCenter()

  bus.on('aa|bb', data => {
    expect(data).toBe(999)
  })

  bus.emit('aa', 999)

  bus.emit('bb', 999)

})

test('watch/invoke', () => {
  const bus = new MessageCenter()

  let fff = (a, b, c) => {
    expect(a).toBe(1)
    expect(b).toBe(2)
    expect(c).toBe(3)
    return {a, b, c}
  }

  bus.watch('kkk', fff)

  let x = bus.invoke('kkk', 1, 2, 3)

  expect(x).toBeInstanceOf(Promise)

  x.then(d => {
    expect(d).toEqual({a: 1, b: 2, c: 3})
  })

  bus.un('kkk', fff)

  console.log(bus._handlers)

  expect(bus._handlers['kkk']).toEqual([])
})

test('noWatch/invoke1', (done) => {
  const bus = new MessageCenter()

  let x = bus.invoke('kkk', 1, 2, 3)

  x.catch(e => {
    expect(e).toBe('have no watcher at event(kkk)')
    done()
  })

})

test('noWatch/invoke2', (done) => {
  const bus = new MessageCenter()

  let fff = (a, b, c) => {
    expect(a).toBe(1)
    expect(b).toBe(2)
    expect(c).toBe(3)
    return {a, b, c}
  }

  bus.watch('kkk', fff)

  let y = bus.invoke('kkk', 1, 2, 3)

  y.then(data => {
    expect(data).toEqual({a: 1, b: 2, c: 3})
    done()
  })

})
