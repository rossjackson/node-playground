interface MapWithConcurrency {
    items: number[]
    limit: number
    asyncFn: (num: number) => Promise<string>
}

export const mapWithCurrency = async ({ items, limit, asyncFn }: MapWithConcurrency) => {
    const results = []
    const executing = new Set()

    for (const item of items) {
        // wrap the execution in promise so we can track
        const p = Promise.resolve().then(() => asyncFn(item))
        results.push(p)

        // add active promise to our tracking set
        executing.add(p)

        // once the promise resolves / rejects, remove it from set
        const clean = () => executing.delete(p)
        p.then(clean).catch(clean)

        // if our active requests hit the limit, pause the loop
        // until at least one promise in the set finishes
        if (executing.size >= limit) {
            console.log(`pausing for item: ${item}`)
            await Promise.race(executing)
        }
    }

    return Promise.allSettled(results)
}