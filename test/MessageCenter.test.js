/**************************************************
 * Created by nanyuantingfeng on 10/03/2017 16:39.
 **************************************************/
import MessageCenter from '../src/MessageCenter'

test('test on/emit', () => {

  const bus = new MessageCenter()

  bus.on('aa|bb', data => {
    expect(data).toBe(999)
  })

  bus.emit('aa', 999)

  bus.emit('bb', 999)

})

test('test once/emit', () => {

  const bus = new MessageCenter()

  bus.once('aa|bb', data => {
    expect(data).toBe(999)
  })

  bus.emit('aa', 999)
  bus.emit('bb', 999)

  expect(bus._handlers).toEqual({'aa': [], 'bb': []})

})

test('test watch/invoke  0', async () => {
  const bus = new MessageCenter()

  let fff = (a, b, c) => {
    expect(a).toBe(1)
    expect(b).toBe(2)
    expect(c).toBe(3)
    return {a, b, c}
  }

  bus.watch('kkk', fff)

  await bus.invoke('kkk', 1, 2, 3).then(d => {
    expect(d).toEqual({a: 1, b: 2, c: 3})
  })

  bus.un('kkk', fff)

  expect(bus._handlers).toEqual({kkk: [], '@@A0F2F71915C05BE72D17F48B2A49CEAD:kkk': []})
})

test('test watch/invoke  1', async () => {
  const bus = new MessageCenter()

  await bus.invoke('kkk', 1, 2, 3).catch(e => {
    expect(e).toBe('have no watcher at event(kkk)')
  })

})

test('test watch/invoke  2', async () => {
  const bus = new MessageCenter()

  let fff = (a, b, c) => {
    expect(a).toBe(1)
    expect(b).toBe(2)
    expect(c).toBe(3)
    return {a, b, c}
  }

  bus.watch('kkk', fff)

  await bus.invoke('kkk', 1, 2, 3).then(data => {
    expect(data).toEqual({a: 1, b: 2, c: 3})
  })

})

test('test clear', () => {
  const bus = new MessageCenter()

  let fff = (a, b, c) => {
    expect(a).toBe(1)
    expect(b).toBe(2)
    expect(c).toBe(3)
    return {a, b, c}
  }

  bus.watch('kkk', fff)
  bus.watch('kkk2', fff)
  bus.watch('kkk3', fff)
  bus.on('kkk4', fff)

  expect(bus._handlers).toMatchSnapshot()

  bus.clear()

  expect(bus._handlers).toEqual({})

})
