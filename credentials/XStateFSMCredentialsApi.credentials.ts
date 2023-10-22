import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class XStateFSMCredentialsApi implements ICredentialType {
	name = 'xStateFSMCredentialsApi';
	displayName = 'XState FSM Definitions API';
	icon = 'file:./../nodes/common/x-state.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'FSM Definitions',
			name: 'fsmDefinitions',
			type: 'json',
			default: ''
		},
	];
}
