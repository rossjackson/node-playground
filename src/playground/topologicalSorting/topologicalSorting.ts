interface Step {
    stepId: string
    dependsOn: string[]
}

/**
 * Kahn's Algorithm
 * Think of this like a ready to go tasks.
 * Look for steps that don't have any dependsOn.
 * As you finish that task, you remove the dependsOn on the step you just did
 * Then you work on the remaining dependsOn that are now empty or has been empty
 * then do that again and remove that Id on the other dependsOn
 * repeat process until you finish your task
 */

export const topologicalSorting = () => {
    const workflow: Step[] = [
        { stepId: "finance_approval", dependsOn: ["legal_review"] },
        { stepId: "vp_signature", dependsOn: ["finance_approval", "security_review"] },
        { stepId: "legal_review", dependsOn: [] },
        { stepId: "security_review", dependsOn: ["legal_review"] }
    ];

    const response = validateAndSortWorkflow(workflow)
    console.log(response)
}

const validateAndSortWorkflow = (steps: Step[]) => {
    // Maps a Step ID to the steps that are waiting on it
    const graph = new Map()
    // Maps a Step ID to its count of pending dependencies
    const inDegree = new Map()

    // Initialize the maps to guarantee 0(1) existence checks
    for (const step of steps) {
        graph.set(step.stepId, [])
        inDegree.set(step.stepId, 0)
    }

    // build the graph and in-degree counts
    for (const step of steps) {
        for (const dep of step.dependsOn) {
            // missing dependency check
            if (!graph.has(dep)) {
                throw new Error(`MISSING_DEPENDENCY: Step ${step.stepId} depends on '${dep}' which does not exist.`)
            }

            // Directed edge from the dependency TO the current step
            graph.get(dep).push(step.stepId)

            // Increment the count of blockers for the current step
            inDegree.set(step.stepId, inDegree.get(step.stepId) + 1)
        }
    }

    // Find all starting points (step with 0 blockers)
    const queue = []
    for (const [stepId, count] of inDegree.entries()) {
        if (count === 0) queue.push(stepId)
    }

    // process the queue to build the execution order
    const executionOrder = []
    while (queue.length > 0) {
        const current = queue.shift()
        executionOrder.push(current)

        // for every step waiting on 'current', remove one blocker
        for (const neighbor of graph.get(current)) {
            inDegree.set(neighbor, inDegree.get(neighbor) - 1)

            // if it has no more blockers, its ready to be executed
            if (inDegree.get(neighbor) === 0) {
                queue.push(neighbor)
            }
        }
    }

    // cycle detection
    // if we couldn't process every node, there is a deadlock/cycle
    if (executionOrder.length !== steps.length) {
        throw new Error('CIRCULAR_DEPENDENCY')
    }

    return executionOrder
}