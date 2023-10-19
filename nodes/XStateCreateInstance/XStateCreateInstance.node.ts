import { INodeType, INodeTypeDescription, IExecuteFunctions, INodeExecutionData, NodeOperationError, IDataObject } from "n8n-workflow";
import { db } from "../common/database";
import { createMachine, createActor } from "xstate";

export class XStateCreateInstance implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'XState Create Instance',
		name: 'XStateCreateInstance',
		icon: 'file:./../common/x-state.svg',
		group: ['transform'],
		version: 1,
		description: 'Create a new FSM instance.',
		defaults: {
			name: 'XState Create Instance',
			subtitle: '={{$parameter["fsmDefinitionId"]}}',
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
				displayName: 'Entity UUID',
				name: 'uuid',
				type: 'string',
				required: true,
				default: '',
				description: 'Unique identifier for the new FSM instance',
				placeholder: 'e.g., 123e4567-e89b-12d3-a456-426614174000',
			},
			{
				displayName: 'FSM Definition ID',
				name: 'fsmDefinitionId',
				type: 'string',
				required: true,
				default: '',
				description: 'Type of the entity for which the FSM instance is being created',
			},
			{
				displayName: 'Initial State',
				name: 'initialState',
				type: 'string',
				default: '', // This will be updated dynamically based on FSM definition's initial state
				description: 'Initial state for the FSM instance. Defaults to the FSM definition initial state.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const uuid = this.getNodeParameter('uuid', 0) as string;
		const fsmDefinitionId = this.getNodeParameter('fsmDefinitionId', 0) as string;
		let initialState = this.getNodeParameter('initialState', 0) as string;

		// Retrieve the FSM definition for the entity
		const fsmDefinitions = await this.getCredentials('databaseFSMCredentialsApi');
		if (!fsmDefinitions) throw new NodeOperationError(this.getNode(), 'FSM definitions not found.');

		const fsmDefinition = (fsmDefinitions.fsmDefinitions as IDataObject[]).find((definition: any) => definition.id === fsmDefinitionId);
		if (!fsmDefinition) throw new NodeOperationError(this.getNode(), 'FSM definition for the specified fsm definition id not found.');

		if (!initialState) {
			if (!fsmDefinition.initial) throw new NodeOperationError(this.getNode(), 'FSM definition does not have an initial state.');
			initialState = fsmDefinition.initial as string;
		}
		let machine;
		try {
			machine = createMachine(fsmDefinition as any);
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Error creating machine: ${error.message}`);
		}

		const state = createActor(machine, {
			state: typeof initialState === 'string' ? machine.resolveStateValue(initialState) : initialState,
		}).getPersistedState();


		// If the FSM instance already exists, throw an error
		const existingInstance = await db('fsm_instances').where({
			uuid: uuid,
			fsmDefinitionId: fsmDefinitionId
		}).first();
		if (existingInstance) throw new NodeOperationError(this.getNode(), `FSM instance with uuid ${uuid} already exists.`);
		// Insert the new FSM instance into the database
		await db('fsm_instances').insert({
			fsmDefinitionId: fsmDefinitionId,
			uuid: uuid,
			state: state?.value,
			persistedState: JSON.stringify(state),
		});

		return [[
			{
				json: {
					uuid: uuid,
					initialState: state
				}
			}
		]];
	}
}
