import {
	MdBrightness5, MdFlip, MdLooks, MdLinearScale, MdGamepad
} from 'react-icons/lib/md';

import {
	FaCab, FaClone, FaCode, FaEraser, FaEllipsisH, FaSquareO
} from 'react-icons/lib/fa';

export default function renderIcon(effectType) {
	switch(effectType) {
		case 'Brightness': return <MdBrightness5 />
		case 'Clear': return <FaEraser />
		case 'External': return <FaCode />
		case 'GameOfLife': return <MdGamepad />
		case 'LarsonEffect': return <FaCab />
		case 'Layer': return <FaClone />
		case 'Mirror': return <MdFlip />
		case 'RainbowEffect': return <MdLooks />
		case 'Stripe': return <FaEllipsisH />
		case 'Switch': return <MdLinearScale />
		default: return <FaSquareO />
	}
}
