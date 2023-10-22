import { INodeType, INodeTypeDescription, IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { db } from "../common/database";

export class XStateRetrieveInstances implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'XState Retrieve Instances',
		name: 'XStateRetrieveInstances',
		icon: 'file:./../common/x-state.svg',
		group: ['transform'],
		version: 1,
		description: 'Retrieve FSM instances based on state and fsmDefinitionId.',
		defaults: {
			name: 'XState Retrieve Instances',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'xStateFSMCredentialsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'FSM Definition ID',
				name: 'fsmDefinitionId',
				type: 'string',
				required: true,
				default: '',
				description: 'ID of the FSM definition to filter instances by',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				required: true,
				default: '',
				description: 'State to filter instances by',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const fsmDefinitionId = this.getNodeParameter('fsmDefinitionId', 0) as string;
		const state = this.getNodeParameter('state', 0) as string;

		// Query the database for FSM instances based on the given parameters
		const instances = await db('fsm_instances').where({
			fsmDefinitionId: fsmDefinitionId,
			state: state,
		});

		return [instances.map((instance:any) => ({ json: instance }))];
	}
}
