import { build } from "rolldown"
import { Buffer } from "node:buffer"
import { mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs"
import path from "node:path"
import { setTimeout } from "node:timers/promises"
import Limiter from "p-limit"
import { promisify } from "node:util"
import zlib from "node:zlib"
import pkgJson from "../package.json" with { type: "json" }
import { tmpdir } from "node:os"
import { generateGraphs } from "./generate-graphs.ts"

const compress = {
  gzip: promisify(zlib.gzip),
  zstd: promisify(zlib.zstdCompress),
}

const limiter = Limiter(5)

const fetchDownloadsLastMonth = async (pkgName: string, attempt = 1): Promise<number> => {
  const url = `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(pkgName)}`

  try {
    const res = await fetch(url, { headers: { "user-agent": "bench-lru-update-script" } })

    if (!res.ok) {
      // For rate limit or server errors, retry a few times
      if (res.status >= 500 && attempt < 3) {
        await setTimeout(250 * attempt)
        return fetchDownloadsLastMonth(pkgName, attempt + 1)
      }
      // 404 or other errors: treat as zero but log
      console.warn(`Warning: Failed to fetch downloads for ${pkgName} (${res.status})`)
      return 0
    }

    const data = (await res.json()) as { downloads?: number }
    const count = typeof data.downloads === "number" ? data.downloads : 0

    return count
  } catch (err) {
    if (attempt < 3) {
      await setTimeout(250 * attempt)
      return fetchDownloadsLastMonth(pkgName, attempt + 1)
    }

    console.warn(`Warning: Network error fetching ${pkgName}:`, err)
    return 0
  }
}

const tempDir = mkdtempSync(path.join(tmpdir(), "bench-lru-update-script-"))
// symlink node_modules to the temp directory
symlinkSync(
  path.join(import.meta.dirname, "..", "node_modules"),
  path.join(tempDir, "node_modules"),
  "dir",
)

const bundleCode = async ({ name, code }: Required<Pick<DataItem, "name" | "code">>) => {
  const filePath = path.join(tempDir, `${name.replace(/\W/g, "")}.js`)
  writeFileSync(filePath, code)

  const result = await build({
    input: filePath,
    platform: "node",
    transform: { target: "node24" },

    resolve: {
      modules: [path.join(import.meta.dirname, "..", "node_modules")],
    },

    write: false,
    output: { format: "esm", minify: true, inlineDynamicImports: true },
  })

  const buffer = new Buffer(result.output[0].code, "utf16le")
  return {
    code: result.output[0].code,
    size: buffer.byteLength,
    gzip: compress.gzip(buffer, { level: 9 }),
    zstd: compress.zstd(buffer, {
      params: { [zlib.constants.ZSTD_c_compressionLevel]: 19 },
    }),
  }
}

type DataItem = {
  name: string
  version: string

  downloadsLastMonth: number

  code?: string
  installSize?: number
  minifiedBundleSize?: number
}

export const updateData = async () => {
  const pkgs = Object.entries(pkgJson.dependencies)
  const existing = (await import("../data.json", { with: { type: "json" } }))
    .default as DataItem[]

  const downloadCountsByName: Record<string, number> = {}
  await Promise.all(
    pkgs.map(async ([name]) => {
      downloadCountsByName[name] = await limiter(() => fetchDownloadsLastMonth(name))
    }),
  )

  const bundleLimiter = Limiter(3)
  const bundleSizeByName: Record<string, Awaited<ReturnType<typeof bundleCode>>> = {}
  await Promise.all(
    pkgs.map(async ([name]) => {
      const data = existing.find((item) => item.name === name)
      if (data == null || data.code == null) return

      bundleSizeByName[name] = await bundleLimiter(() =>
        bundleCode({ name, code: data.code! }),
      )
    }),
  )

  const updated = existing.map(
    (item): DataItem => ({
      name: item.name,
      version: pkgs.find(([name]) => name === item.name)![1],
      code: item.code,

      downloadsLastMonth: downloadCountsByName[item.name],

      minifiedBundleSize: bundleSizeByName[item.name]?.size,
    }),
  )

  // 5) Write back to data.json
  writeFileSync(
    path.resolve(import.meta.dirname, "..", "data.json"),
    JSON.stringify(updated, null, 2),
  )
}

if (process.argv[2] === "--update") {
  await updateData()
}

let readmeContents = readFileSync("README.md", "utf8")
const benchmarkStart =
  readmeContents.indexOf("<!-- BENCHMARKS START -->") + "<!-- BENCHMARKS START -->".length
const benchmarkEnd = readmeContents.indexOf("<!-- BENCHMARKS END -->")

const graphs = await generateGraphs()
readmeContents = `${readmeContents.slice(0, benchmarkStart)}\n${graphs}\n${readmeContents.slice(benchmarkEnd)}`
writeFileSync("README.md", readmeContents)
