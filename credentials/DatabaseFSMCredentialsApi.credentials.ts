import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DatabaseFSMCredentialsApi implements ICredentialType {
	name = 'databaseFSMCredentialsApi';
	displayName = 'Database FSM Credentials API';
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
