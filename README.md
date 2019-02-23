# Batching Toposort

```hs
batchingToposort :: { DependencyId : [DependentId] } -> [[TaskId]]
```

*   Efficiently convert an acyclic dependency graph into a sequence of parallel task batches.
*   Runtime is O(|V| + |E|).
*   No dependencies.

## Motivation

Often one needs to perform a sequence of interdependent tasks. In order to determine task order, the classic solution is to use [topological sort](). However, toposort typically outputs a list of individual tasks, without grouping those that can be executed concurrently. Batching-Toposort takes this additional consideration into account, efficiently producing a ordered list of sets of tasks which can safely be performed together.

## Usage

```sh
npm install batching-toposort
```

Batching Toposort expects a [directed acyclic graph]() (DAG) implemented via [adjacency list](). In short, construct an object whose keys are dependency IDs, and whose values are lists of dependent IDs.

```js
const batchingToposort = require('batching-toposort')

// DAG :: { dependencyId : [dependentId] }
const DAG = {
    a: ['c', 'f'], // `a` is a dependency of `c` and `f`
    b: ['d', 'e'],
    c: ['f'],
    d: ['f', 'g'],
    e: ['h'],
    f: ['i'],
    g: ['j'],
    h: ['j'],
    i: [],
    j: [],
}

// batchingToposort :: DAG -> [[taskId]]
const taskBatches = batchingToposort(DAG)
// [[a, b], [c, d, e], [f, g, h], [i, j]]
```

If there is demand, Batching-Toposort may one day include a small DAG API for convenience, but as of now it is the developer's role to construct the graph.

## Implementation

The classic DAG toposort keeps track of each task's in-degree (number of dependencies). As tasks with no dependencies are added to the output list, their dependents' in-degree counts are decremented. Batching-Toposort removes zero-dependency tasks from the graph in passes, rather than continuously. The core algorithm is illustrated below in pseudocode (the actual implementation is in `src`).

```
let G = adjacency list of tasks and dependents (~O(1) lookup)
let N = map from tasks to in-degree counts (~O(1) lookup / update)
let L = [] (empty output list) (~O(1) append)
let S1 = set of tasks with in-degree 0 (~O(1) addition, ~O(n) iteration)

while S1 is nonempty
    append S1 to L
    let S2 = empty set (of next batch)
    for each task T in S1
        for each dependent D of T (as per G)
            decrement in-degree count for D (in N)
            if D's in-degree (as per N) is 0
                add D to S2
    S1 = S2

return L
```
