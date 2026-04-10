import pkg from '../../../package.json' with { type: 'json' }

export const asyncGenerator = async () => {
    const { name } = pkg
    console.log('starting async generator')
    for await (const count of delayedCounter(1, 10)) {
        console.log(`Received: ${count}`)
    }
    console.log('finished', name)
}

async function* delayedCounter(start: number, end: number) {
    for (let idx = 0; idx <= end; idx++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        yield idx
    }
}