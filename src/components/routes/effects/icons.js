// import FaAutomobile from 'react-icons/lib/fa/automobile';
import FaCab from 'react-icons/lib/fa/cab';
import FaClone from 'react-icons/lib/fa/clone';
// import FaCircleThin from 'react-icons/lib/fa/circle-thin';
import FaCode from 'react-icons/lib/fa/code';
import FaEraser from 'react-icons/lib/fa/eraser';
import FaEllipsisH from 'react-icons/lib/fa/ellipsis-h';
// import FaLightbulbO from 'react-icons/lib/fa/lightbulb-o';
import FaSquareO from 'react-icons/lib/fa/square-o';

import MdBrightness5 from 'react-icons/lib/md/brightness-5';
import MdFlip from 'react-icons/lib/md/flip';
import MdLooks from 'react-icons/lib/md/looks';
import MdLinearScale from 'react-icons/lib/md/linear-scale';

export default function renderIcon(effectType) {
	switch(effectType) {
		case 'Brightness': return <MdBrightness5 />
		case 'Clear': return <FaEraser />
		case 'External': return <FaCode />
		case 'LarsonEffect': return <FaCab />
		case 'Layer': return <FaClone />
		case 'Mirror': return <MdFlip />
		case 'RainbowEffect': return <MdLooks />
		case 'Stripe': return <FaEllipsisH />
		case 'Switch': return <MdLinearScale />
		default: return <FaSquareO />
	}
}
