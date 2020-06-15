/**
 * Author: Huan LI https://github.com/huan
 * Date: Jun 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  log,
  Friendship,
}                   from 'wechaty'

import {
  StringMatcherOptions,
  stringMatcher,
}                         from '../matchers/'
import {
  contactTalker,
  ContactTalkerOptions,
}                         from '../talkers/'

export interface FriendshipAccepterConfig {
  greeting?: ContactTalkerOptions,
  keyword?: StringMatcherOptions,
}

export function FriendshipAccepter (
  config: FriendshipAccepterConfig = {},
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'FriendshipAccepter("%s")', JSON.stringify(config))

  const doGreeting     = contactTalker(config.greeting)
  const isMatchKeyword = stringMatcher(config.keyword)

  return function FriendshipAccepterPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'FriendshipAccepter installing on %s ...', wechaty)

    wechaty.on('friendship', async friendship => {
      log.verbose('WechatyPluginContrib', 'FriendshipAccepter wechaty.on(friendship) %s', friendship)

      const friendshipType = friendship.type()

      switch (friendshipType) {
        case Friendship.Type.Receive:
          const hello = friendship.hello()
          if (await isMatchKeyword(hello)) {
            await friendship.accept()
          }
          break

        case Friendship.Type.Confirm:
          const contact = friendship.contact()
          await doGreeting(contact)
          break

        case Friendship.Type.Verify:
          // This is for when we send a message to others, but they did not accept us as a friend.
          break

        default:
          throw new Error('friendshipType unknown: ' + friendshipType)
      }
    })
  }

}
