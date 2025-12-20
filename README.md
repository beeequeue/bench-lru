# bench-lru

A set of simple benchmarks for various LRU packages.

---

<!-- BENCHMARKS START -->

node 24.12.0 (x64-win32)

4.91GHz AMD Ryzen 7 9800X3D 8-Core Processor

---

```mermaid
xychart-beta
  title "downloads in last month"
  x-axis ["flru", "hashlru", "lru.min", "lru_map", "picolru", "quick-lru", "tiny-lru", "ylru"]
  y-axis "downloads" 0 --> 126098786
  bar [446231, 796883, 22178365, 9222208, 11, 126098786, 5173069, 13570791]
```

Hidden outliers:

- `lru-cache`: `1,154,015,643`
<details>

<summary>Complete graph with outliers</summary>

```mermaid
xychart-beta
  title "downloads in last month"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "tiny-lru", "ylru"]
  y-axis "downloads"
  bar [446.231, 796.883, 1154015.643, 22178.365, 9222.208, 0.011, 126098.786, 5173.069, 13570.791]
```

</details>

---

```mermaid
xychart-beta
  title "minified bundle size"
  x-axis ["flru", "hashlru", "lru.min", "lru_map", "picolru", "quick-lru", "tiny-lru", "ylru"]
  y-axis "bytes" 0 --> 7128
  bar [1890, 2286, 4256, 7128, 4252, 6552, 4784, 1972]
```

Hidden outliers:

- `lru-cache`: `34,276`
<details>

<summary>Complete graph with outliers</summary>

```mermaid
xychart-beta
  title "minified bundle size"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "tiny-lru", "ylru"]
  y-axis "bytes"
  bar [1.89, 2.286, 34.276, 4.256, 7.128, 4.252, 6.552, 4.784, 1.972]
```

</details>

---

```mermaid
xychart-beta
  title "INIT"
  x-axis ["flru", "hashlru", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest" 1 --> 2.7133
  bar [2.7133, 2.236, 1.0847, 1.0826, 2.3647, 1.0174, 1, 1.6832]
```

Hidden outliers:

- `lru-cache`: `2,758.97`
- `lru.min`: `4,113.66`
<details>

<summary>Complete graph with outliers</summary>

```mermaid
xychart-beta
  title "INIT"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest"
  bar [0.0027, 0.0022, 2.759, 4.1137, 0.0011, 0.0011, 0.0024, 0.001, 0.001, 0.0017]
```

</details>

---

```mermaid
xychart-beta
  title "SET STRING (10 000)"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest" 1 --> 2.2393
  bar [1, 1.1145, 2.1532, 2.0857, 2.2186, 2.2393, 2.1684, 2.1055, 1.7406, 2.1328]
```

---

```mermaid
xychart-beta
  title "SET LONG STRING (10 000)"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest" 1 --> 1.4333
  bar [1, 1.0604, 1.3813, 1.3829, 1.4333, 1.3735, 1.3869, 1.3588, 1.4309, 1.4]
```

---

```mermaid
xychart-beta
  title "GET STRING (10 000)"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest" 1 --> 3.5045
  bar [1, 1.1536, 2.0374, 1.9683, 2.0119, 2.4329, 2.0761, 3.5045, 1.6867, 1.9208]
```

---

```mermaid
xychart-beta
  title "GET LONG STRING (10 000)"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest" 1 --> 2.8548
  bar [1, 1.1735, 2.146, 2.0322, 2.14, 2.7005, 1.7984, 2.8548, 1.329, 1.5357]
```

---

```mermaid
xychart-beta
  title "SET WITH EVICTION (10 000)"
  x-axis ["flru", "hashlru", "lru-cache", "lru.min", "lru_map", "picolru", "quick-lru", "semver", "tiny-lru", "ylru"]
  y-axis "speed relative to fastest" 1 --> 1.9678
  bar [1, 1.1814, 1.9678, 1.829, 1.5578, 1.6495, 1.6303, 1.4336, 1.3573, 1.488]
```

<!-- BENCHMARKS END -->
