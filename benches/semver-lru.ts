export class SemverLRUCache {
  max: number
  map: Map<any, any>

  constructor(max: number = 1000) {
    this.max = max
    this.map = new Map()
  }

  get(key: any) {
    const value = this.map.get(key)
    if (value === undefined) {
      return undefined
    } else {
      // Remove the key from the map and add it to the end
      this.map.delete(key)
      this.map.set(key, value)
      return value
    }
  }

  delete(key: any) {
    return this.map.delete(key)
  }

  set(key: any, value: any) {
    const deleted = this.delete(key)

    if (!deleted && value !== undefined) {
      // If cache is full, delete the least recently used item
      if (this.map.size >= this.max) {
        const firstKey = this.map.keys().next().value
        this.delete(firstKey)
      }

      this.map.set(key, value)
    }

    return this
  }
}
