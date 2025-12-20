const formatNumber = (num: number) =>
  num.toLocaleString("en-US", { maximumFractionDigits: 2 })

type Layout = { name: string | null; types: Array<"g" | "s" | "b"> }

const formatToMicroSeconds = (nanoseconds: number) => (nanoseconds / 1000).toFixed(4)

export const generateGraphs = async () => {
  const { default: results } = await import("../bench.json", { with: { type: "json" } })
  const { context } = results
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

    const totalAvg =
      relativePercentages.reduce((accum, value) => accum + Number(value), 0) /
      relativePercentages.length

    const shownXAxises: string[] = []
    const withoutOutliers: number[] = []
    const outliers: Array<[string, number]> = []
    for (let i = 0; i < relativePercentages.length; i++) {
      const axisName = xAxis[i]
      const percent = relativePercentages[i]
      if (percent / totalAvg > 2) {
        outliers.push([axisName, percent])
        continue
      }

      shownXAxises.push(axisName)
      withoutOutliers.push(percent)
    }

    const outlierText =
      outliers.length !== 0
        ? `\nHidden outliers:\n${outliers.map(([name, amount]) => `- \`${name}: ${formatNumber(amount)}x\``).join("\n")}\n`
        : ""

    return `
\`\`\`mermaid
xychart-beta
  title "${name}"
  x-axis ["${shownXAxises.join('", "')}"]
  y-axis "speed relative to fastest"
  bar [${withoutOutliers.map(formatToMicroSeconds).join(", ")}]
\`\`\`
${outlierText}
---
`.trim()
  })

  const markdown = `
${context.runtime} ${context.version} (${context.arch})

${context.cpu.freq.toFixed(2)}GHz ${context.cpu.name.trim()}

---

${graphs.join("\n\n")}
`.trim()

  return markdown
}
