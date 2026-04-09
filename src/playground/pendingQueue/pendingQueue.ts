const downloadPdfMock = async (index: number) => {
    return new Promise((resolve, reject) => setTimeout(() => index === 20 ? reject('me no like 20') : resolve(console.log(`downloaded index: ${index}`)), 300))
}

export const pendingQueue = () => {
    const queue = new AsyncQueue(4)
    for (let i = 0; i < 50; i++) {
        queue.enqueue(() => downloadPdfMock(i).catch(e => console.log(e)));
    }
}

class AsyncQueue {
    limit: number;
    activeCount: number;
    pendingQueue: Array<() => void>; // Holds functions that trigger the next step

    constructor(concurrencyLimit: number) {
        this.limit = concurrencyLimit;
        this.activeCount = 0;
        this.pendingQueue = [];
    }

    /**
     * We return a new Promise immediately, but we DO NOT execute taskFn yet.
     */
    enqueue<T>(taskFn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {

            // 1. Wrap the task execution, resolution, and cleanup in a single closure
            const executeTask = async () => {
                this.activeCount++;
                try {
                    const result = await taskFn();
                    resolve(result); // Resolves the specific promise returned to the caller
                } catch (error) {
                    reject(error)
                } finally {
                    this.activeCount--;
                    this.processNext(); // Task is done, trigger the next one in line
                }
            };

            // 2. Put the wrapped task in the waiting line
            this.pendingQueue.push(executeTask);

            // 3. Try to process the queue (will do nothing if we are at the limit)
            this.processNext();
        });
    }

    /**
     * The Engine: Checks if we have capacity, and if so, runs the next task.
     */
    private processNext() {
        if (this.activeCount < this.limit && this.pendingQueue.length > 0) {
            // Dequeue the next task and execute it
            const nextTask = this.pendingQueue.shift();
            if (nextTask) nextTask();
        }
    }
}