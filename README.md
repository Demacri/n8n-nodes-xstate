
# n8n-nodes-xstate

A custom node package for [n8n](https://n8n.io/), providing integration with [xstate v5](https://stately.ai/docs/category/get-started).

## Installation

```bash
npm install n8n-nodes-xstate
```

## Features

- Manage Finite State Machines (FSM) instances.
- Execute actions on entity instances based on xstate definitions.
- Query FSM instances based on their state and definition.

## Usage

1. Install the package using npm or yarn.
2. Use the provided nodes in your n8n workflow.
3. Configure nodes using the provided parameters such as `uuid`, `entityName`, and `action`.

## Nodes

- XStateExecuteAction: Execute an action on an entity instance and get the previous and current state.
- XStateRetrieveInstances: Retrieve all FSM instances based on their state and definition ID.
- XStateCreateInstance: Create a new FSM instance.

## Configuration

Ensure you have the necessary environment variables set up for database connections.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
