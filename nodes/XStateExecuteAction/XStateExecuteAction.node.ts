import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { db } from '../common/database';
import { createMachine, createActor, MachineConfig } from 'xstate';

export class XStateExecuteAction implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'XState Execute Action',
		name: 'XStateExecuteAction',
		icon: 'file:./../common/x-state.svg',
		group: ['transform'],
		version: 1,
		description: 'Execute an action on an fsm instance based on its FSM.',
		defaults: {
			name: 'XState Execute Action',
			subtitle: '={{$parameter["fsmDefinitionId"] + ": " + $parameter["action"]}}',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'databaseFSMCredentialsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'FSM UUID',
				name: 'uuid',
				type: 'string',
				required: true,
				default: '',
				description: 'Unique identifier of the fsm instance',
				placeholder: 'e.g., 123e4567-e89b-12d3-a456-426614174000',
			},
			{
				displayName: 'FSM Definition ID',
				name: 'fsmDefinitionId',
				type: 'string',
				required: true,
				default: '',
			},
			{
				displayName: 'Action',
				name: 'action',
				type: 'string',
				required: true,
				default: '',
				description: 'Action to be executed on the FSM instance',
			},
		],
	};
	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const uuid = this.getNodeParameter('uuid', 0) as string;
		const actionToExecute = this.getNodeParameter('action', 0) as string;

		// 1. Retrieve the FSM definition for the given fsmDefinitionId
		const fsmDefinitions = await this.getCredentials('databaseFSMCredentialsApi');
		if (!fsmDefinitions) throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
		const fsmDefinition = (fsmDefinitions.fsmDefinitions as IDataObject[]).find((definition: any) => definition.id === this.getNodeParameter('fsmDefinitionId', 0) as string);
		let machine;
		try {
			machine = createMachine(fsmDefinition as MachineConfig<any, any, any>);
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Error creating machine: ${error.message}`);
		}
		// 2. Get fsm's current state from the database
		const [fsm] = await db('fsm_instances').where('uuid', uuid);
		if (!fsm) throw new NodeOperationError(this.getNode(), `No FSM instance found with uuid ${uuid}`);

		let fsmState;
		try {
			fsmState = JSON.parse(fsm.persistedState);
		}
		catch (error) {
			throw new NodeOperationError(this.getNode(), `Error parsing persisted state: ${error.message}`);
		}
		// 3. Check if the action is executable
		const actor = createActor(machine, {
			state: fsmState
		}).start();

		const canTransition = actor.getSnapshot().can({ type: actionToExecute });
		if (canTransition) {
			actor.send({ type: actionToExecute });
			// Update entity's state in the database
			await db('fsm_instances').where('uuid', uuid).update({
				state: actor.getSnapshot().value,
				persistedState: JSON.stringify(actor.getPersistedState()),
			});
		}
		// 5. Return the previous state and the new state
		return [[
			{
				json: {
					previousState: fsmState,
					currentState: actor.getPersistedState(),
					transitioned: canTransition
				}
			}
		]];
	}

	static async init() {
		if (!await db.schema.hasTable('fsm_instances')) {
			await db.schema.createTable('fsm_instances', (table: any) => {
				table.increments('id').primary();
				table.string('state').notNullable();
				table.string('fsmDefinitionId').notNullable();
				table.string('uuid').notNullable();
				table.json('persistedState').notNullable();
				table.unique(['fsmDefinitionId', 'uuid']);
			});
			console.log("Created table fsm_instances");
		} else {
			console.log("Table fsm_instances already exists");
		}
	}
};

// Call the static initializer
XStateExecuteAction.init().catch((error) => {
	console.error("Error initializing XStateExecuteAction:", error);
});
