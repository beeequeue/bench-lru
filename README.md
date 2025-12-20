# bench-lru

A set of simple benchmarks for various LRU packages.

---

<!-- BENCHMARKS START -->

node 24.12.0 (x64-win32)

4.91GHz AMD Ryzen 7 9800X3D 8-Core Processor

---

```mermaid
xychart-beta
  title "INIT"
  x-axis ["flru", "hashlru", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest"
  bar [2.7133, 2.2360, 1.0847, 1.0826, 2.3647, 1.0174, 1.0000, 1.6832]
```

Hidden outliers:

- `lru-cache: 2,758,965.52x`
- `lru.min: 4,113,656.32x`

---

```mermaid
xychart-beta
  title "SET STRING (10 000)"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest"
  bar [1.0000, 1.1145, 2.1532, 2.0857, 2.2186, 2.2393, 2.1684, 2.1055, 1.7406, 2.1328]
```

---

```mermaid
xychart-beta
  title "SET LONG STRING (10 000)"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest"
  bar [1.0000, 1.0604, 1.3813, 1.3829, 1.4333, 1.3735, 1.3869, 1.3588, 1.4309, 1.4000]
```

---

```mermaid
xychart-beta
  title "GET STRING (10 000)"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest"
  bar [1.0000, 1.1536, 2.0374, 1.9683, 2.0119, 2.4329, 2.0761, 3.5045, 1.6867, 1.9208]
```

---

```mermaid
xychart-beta
  title "GET LONG STRING (10 000)"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest"
  bar [1.0000, 1.1735, 2.1460, 2.0322, 2.1400, 2.7005, 1.7984, 2.8548, 1.3290, 1.5357]
```

---

```mermaid
xychart-beta
  title "SET WITH EVICTION (10 000)"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest"
  bar [1.0000, 1.1814, 1.9678, 1.8290, 1.5578, 1.6495, 1.6303, 1.4336, 1.3573, 1.4880]
```

<!-- BENCHMARKS END -->
