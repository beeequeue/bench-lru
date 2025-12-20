import { writeFileSync } from "node:fs"
import HashLRU from "hashlru"
import FLRU from "flru"
import { barplot, bench, group, run, summary } from "mitata"
import { LRUCache } from "lru-cache"
import LRUMap from "lru_map"
import { createLRU } from "lru.min"
import { lru as tinyLru } from "tiny-lru"
import QuickLRU from "quick-lru"
import PicoLRU from "picolru"
import { LRU as YLRU } from "ylru"
import { SemverLRUCache } from "./semver-lru.ts"

type Cache<K, V> = {
  get: (key: K) => V | undefined
  set: (key: K, value: V) => void
}

const caches = new Map<string, (amount: number) => Cache<any, any>>([
  ["flru", (amount: number) => FLRU(amount)],
  ["hashlru", (amount: number) => HashLRU(amount)],
  ["lru-cache", (amount: number) => new LRUCache({ max: amount })],
  ["lru.min", (amount: number) => createLRU({ max: amount })],
  ["lru_map", (amount: number) => new LRUMap.LRUMap(amount)],
  ["picolru", (amount: number) => new PicoLRU({ maxSize: amount })],
  ["quick-lru", (amount: number) => new QuickLRU({ maxSize: amount })],
  ["semver", (amount: number) => new SemverLRUCache(amount)],
  ["tiny-lru", (amount: number) => tinyLru(amount)],
  ["ylru", (amount: number) => new YLRU(amount)],
])

const longKeys: string[] = []
const data: number[] = []
for (let i = 0; i < 100_000; i++) {
  const key = Math.floor(Math.random() * 100_000).toString()
  longKeys.push(`${key}${key}${key}${key}`)
  data.push(Math.floor(Math.random() * 100_000))
}

barplot(() => {
  summary(() => {
    group("INIT", () => {
      for (const [name, init] of caches.entries()) {
        bench(name, function* () {
          yield {
            0(): () => Cache<string, string> {
              return () => init(10_000)
            },

            bench(c: () => Cache<string, string>) {
              return c()
            },
          }
        })
      }
    })

    group("SET STRING (10 000)", () => {
      for (const [name, init] of caches.entries()) {
        bench(name, function* () {
          yield {
            0(): Cache<string, string> {
              return init(50_000)
            },

            bench(cache: Cache<string, string>) {
              for (let i = 0; i < 10_000; i++) {
                cache.set(i.toString(), data[i].toString())
              }
              return cache
            },
          }
        }).gc("inner")
      }
    })

    group("SET LONG STRING (10 000)", () => {
      for (const [name, init] of caches.entries()) {
        bench(name, function* () {
          yield {
            0(): Cache<string, string> {
              return init(50_000)
            },

            bench(cache: Cache<string, string>) {
              for (let i = 0; i < 10_000; i++) {
                cache.set(longKeys[i].toString(), data[i].toString())
              }
              return cache
            },
          }
        }).gc("inner")
      }
    })

    group("GET STRING (10 000)", () => {
      for (const [name, init] of caches.entries()) {
        bench(name, function* () {
          yield {
            0(): Cache<string, string> {
              const cache = init(50_000)
              for (let i = 0; i < 10_000; i++) {
                cache.set(i.toString(), data[i].toString())
              }
              return cache
            },

            bench(cache: Cache<string, string>) {
              const arr = []
              for (let i = 0; i < 10_000; i++) {
                arr.push(cache.get(i.toString()))
              }
              return arr
            },
          }
        }).gc("inner")
      }
    })

    group("GET LONG STRING (10 000)", () => {
      for (const [name, init] of caches.entries()) {
        bench(name, function* () {
          yield {
            0(): Cache<string, string> {
              const cache = init(50_000)
              for (let i = 0; i < 10_000; i++) {
                cache.set(longKeys[i].toString(), data[i].toString())
              }
              return cache
            },

            bench(cache: Cache<string, string>) {
              const arr = []
              for (let i = 0; i < 10_000; i++) {
                arr.push(cache.get(longKeys[i].toString()))
              }
              return arr
            },
          }
        }).gc("inner")
      }
    })

    group("SET WITH EVICTION (10 000)", () => {
      for (const [name, init] of caches.entries()) {
        bench(name, function* () {
          yield {
            0(): Cache<string, string> {
              return init(10_000)
            },

            bench(cache: Cache<string, string>) {
              for (let i = 0; i < 10_000; i++) {
                cache.set(`evict-${longKeys[i]}`, data[i].toString())
              }
              return cache
            },
          }
        }).gc("inner")
      }
    })
  })
})

const results = await run({ throw: true })
writeFileSync("bench.json", JSON.stringify(results))
