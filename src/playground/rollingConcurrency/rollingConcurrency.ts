import pLimit from 'p-limit'
import { fetchMock } from './fetchMock.js'
import { mapWithCurrency } from './mapWithCurrency.js'

const limit = pLimit(3)

export const rollingConcurrency = async () => {
    const randomArr = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100))
    const result = await useCustomConcurrency({ randomArr })
    console.log(result)
}

interface RandomArr {
    randomArr: number[]
}

const useCustomConcurrency = async ({ randomArr }: RandomArr) => {

    const fetchStatus = async (item: number) => {
        return await fetchMock({ mockResponse: item.toString() })
    }

    const results = await mapWithCurrency({
        asyncFn: fetchStatus,
        items: randomArr,
        limit: 3
    })

    console.log(results)
}

const usePLimit = async ({ randomArr }: RandomArr) => {
    const fetchMocks = randomArr.map((num) => {
        return limit(() => fetchMock({ mockResponse: num.toString() }))
    })

    // Check status periodically
    const interval = setInterval(() => {
        console.log(`Active: ${limit.activeCount}`);   // Tasks currently running
        console.log(`Queued: ${limit.pendingCount}`);  // Tasks waiting for a slot

        if (limit.activeCount === 0 && limit.pendingCount === 0) {
            clearInterval(interval);
        }
    }, 500);
    return await Promise.all(fetchMocks)
}