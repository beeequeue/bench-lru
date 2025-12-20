import type { ctx, trial } from "mitata"

const formatNumber = (num: number) =>
  num.toLocaleString("en-US", { maximumFractionDigits: 2 })

type Layout = { name: string | null; types: Array<"g" | "s" | "b"> }

const formatToMicroSeconds = (nanoseconds: number) =>
  Number((nanoseconds / 1000).toFixed(4))

type GraphOptions = {
  name: string
  yAxis: string
  min?: number
  max?: number
  input: Map<string, number>
}

const generateBasicGraphs = ({ name, yAxis, min, max, input }: GraphOptions): string => {
  const keys = Array.from(input.keys())
  const values = Array.from(input.values())
  const avgValue = values.reduce((accum, value) => accum + value, 0) / input.size

  const normalAxisLabels: string[] = []
  const normalValues: number[] = []
  const outliers: Array<[string, number]> = []
  for (let i = 0; i < values.length; i++) {
    if (values[i] / avgValue > 2) {
      outliers.push([keys[i], values[i]])
      continue
    }

    normalAxisLabels.push(keys[i])
    normalValues.push(values[i])
  }

  const minValue = min ?? Math.min(...normalValues)
  const maxValue = max ?? Math.max(...normalValues)
  let mermaidGraph = `
\`\`\`mermaid
xychart-beta
  title "${name}"
  x-axis ["${normalAxisLabels.join('", "')}"]
  y-axis "${yAxis}" ${minValue} --> ${maxValue}
  bar [${normalValues.join(", ")}]
\`\`\`
`.trim()

  if (outliers.length !== 0) {
    mermaidGraph += `\nHidden outliers:\n${outliers.map(([name, amount]) => `- \`${name}\`: \`${formatNumber(amount)}\``).join("\n")}\n`

    mermaidGraph += `\n
<details>

<summary>Complete graph with outliers</summary>

\`\`\`mermaid
xychart-beta
  title "${name}"
  x-axis ["${keys.join('", "')}"]
  y-axis "${yAxis}"
  bar [${values.map(formatToMicroSeconds).join(", ")}]
\`\`\`

</details>
`.trim()
  }

  return mermaidGraph
}

const generateMitataGraphs = (results: { context: ctx; benchmarks: trial[] }) => {
  const layout = (results as any).layout as Layout[]

  const groups = layout
    .map((layout, index) => ({ index, ...layout }))
    .filter(({ name, types }) => name != null && types.includes("g"))
  const benchmarksByGroup = Map.groupBy(results.benchmarks, ({ group }) => group)

  const graphs = groups.map(({ index, name }) => {
    const benchmarks = benchmarksByGroup.get(index)!
    const xAxis = benchmarks.map(({ alias }) => alias) ?? []
    const values = benchmarks.map(({ runs }) => runs[0].stats!.avg) ?? []
    const lowestValue = values.reduce(
      (accum, value) => (value < accum ? value : accum),
      Number.POSITIVE_INFINITY,
    )
    const relativePercentages = values.map((value) =>
      Number(((value / lowestValue) * 1000).toFixed(3)),
    )

    return generateBasicGraphs({
      name: name!,
      yAxis: "speed relative to fastest",
      input: new Map(
        relativePercentages.map((value, index) => [
          xAxis[index],
          formatToMicroSeconds(value),
        ]),
      ),
    })
  })

  return graphs
}

export const generateGraphs = async () => {
  const { default: results } = await import("../bench.json", { with: { type: "json" } })
  const { context } = results
  const mermaidGraphs = generateMitataGraphs(results as never)

  const { default: data } = await import("../data.json", { with: { type: "json" } })
  const sizeByPackage = new Map<string, number>()
  const downloadsByPackage = new Map<string, number>()
  for (const { name, downloadsLastMonth, minifiedBundleSize } of data) {
    sizeByPackage.set(name, minifiedBundleSize != null ? minifiedBundleSize : 0)
    downloadsByPackage.set(name, downloadsLastMonth!)
  }
  mermaidGraphs.unshift(
    generateBasicGraphs({
      name: "minified bundle size",
      yAxis: "bytes",
      min: 0,
      input: sizeByPackage,
    }),
  )
  mermaidGraphs.unshift(
    generateBasicGraphs({
      name: "downloads in last month",
      yAxis: "downloads",
      min: 0,
      input: downloadsByPackage,
    }),
  )

  const markdown = `
${context.runtime} ${context.version} (${context.arch})

${context.cpu.freq.toFixed(2)}GHz ${context.cpu.name.trim()}

---

${mermaidGraphs.join("\n\n---\n\n")}
`.trim()

  return markdown
}
