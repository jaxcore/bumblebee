// Assistants
import BumblebeeAssistant from './bumblebee/Bumblebee-Assistant';
import TerminatorAssistant from './terminator/Terminator-Assistant';

const assistants = [
	{
		hotword: 'bumblebee',
		name: 'Bumblebee',
		assistant: BumblebeeAssistant,
	},
	{
		hotword: 'terminator',
		name: 'Terminator',
		assistant: TerminatorAssistant,
	}
];

export default assistants;