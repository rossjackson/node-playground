import { runTests } from "./runTests.js";

/**
 * The Task:
 * You are given a JSON array of chronological events representing actions taken on various contracts.
 * You must process these events and output the final state of each contract.
 *
 * Rules provided so far:
 * 1. A contract must be CREATED before any other action can occur.
 * 2. A contract cannot be PUBLISHED unless all added approvers have APPROVED.
 * 3. If an unauthorized user attempts an action, the event should be ignored.
 */

interface Event {
  timestamp: number;
  contractId: string;
  action: "CREATE" | "APPROVE" | "PUBLISH" | "REJECT" | "ADD_APPROVER";
  userId: string;
}

interface ContractResponse {
  status: "CREATED" | "PUBLISHED" | "REJECTED";
  approvers: string[];
  owner: string;
}

interface ContractState extends ContractResponse {
  approvedBy: Set<string>;
}

const processEvents = (events: Event[]): Record<string, ContractResponse> => {
  const store = new Map<string, ContractState>();

  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

  for (const event of sortedEvents) {
    const { contractId, action, userId } = event;
    const state = store.get(contractId);

    // Rule 1: A contract must be CREATED before any other action can occur.
    if (!state && action !== "CREATE") {
      continue;
    }

    // If you want to change from switch!
    // // Direct O(1) lookup instead of iterating through switch cases
    // const handler = actionHandlers[action];

    // if (handler) {
    //   handler(state, event, store);
    // } else {
    //   // Optional: Handle unknown actions
    //   console.warn(`Unknown action type: ${action}`);
    // }

    switch (action) {
      case "CREATE":
        if (!state) {
          store.set(contractId, {
            status: "CREATED",
            approvers: [],
            owner: userId,
            approvedBy: new Set(),
          });
        }
        break;

      case "ADD_APPROVER":
        // The event log shows the userId in this event is the person being added
        if (state && !state.approvers.includes(userId)) {
          state.approvers.push(userId);
        }
        break;

      case "APPROVE":
        // Rule 3: If an unauthorized user attempts an action, ignore.
        // Only valid approvers can approve.
        if (state && state.approvers.includes(userId)) {
          state.approvedBy.add(userId);
        }
        break;

      case "REJECT":
        if (state) {
          state.status = "REJECTED";
        }
        break;

      case "PUBLISH":
        // Rule 2 & 3: Cannot publish unless all added approvers have approved,
        // and only the owner can publish.
        if (state && state.owner === userId) {
          const allApproved = state.approvers.every((approver) =>
            state.approvedBy.has(approver),
          );

          if (allApproved) {
            state.status = "PUBLISHED";
          }
        }
        break;
    }
  }

  // Format the Map back into the expected outputs.json structure
  const result: Record<string, ContractResponse> = {};
  for (const [id, state] of store.entries()) {
    result[id] = {
      status: state.status,
      approvers: state.approvers,
      owner: state.owner,
    };
  }

  return result;
};

export const runContractsTest = () => {
  runTests({
    inputsFilename: "inputs.json",
    outputsFilename: "outputs.json",
    processData: processEvents,
  });
};

// You can also use a record for the action handlers like

const actionHandlers: Record<
  string,
  (
    state: ContractState | undefined,
    event: any,
    store: Map<string, ContractState>,
  ) => void
> = {
  CREATE: (state, event, store) => {
    if (!state) {
      store.set(event.contractId, {
        status: "CREATED",
        approvers: [],
        owner: event.userId,
        approvedBy: new Set(),
      });
    }
  },

  ADD_APPROVER: (state, event) => {
    if (state && !state.approvers.includes(event.userId)) {
      state.approvers.push(event.userId);
    }
  },

  APPROVE: (state, event) => {
    if (state && state.approvers.includes(event.userId)) {
      state.approvedBy.add(event.userId);
    }
  },

  REJECT: (state) => {
    if (state) {
      state.status = "REJECTED";
    }
  },

  PUBLISH: (state, event) => {
    if (state && state.owner === event.userId) {
      const allApproved = state.approvers.every((approver) =>
        state.approvedBy.has(approver),
      );
      if (allApproved) {
        state.status = "PUBLISHED";
      }
    }
  },
};
