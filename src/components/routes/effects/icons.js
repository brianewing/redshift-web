import {
	MdBrightness5, MdFlip, MdLooks, MdLinearScale
} from 'react-icons/md';

import {
	FaCab, FaClone, FaCode, FaEraser, FaEllipsisH, FaSquareO
} from 'react-icons/fa';

import {
	GiConwayLifeGlider
} from 'react-icons/gi';

export default function renderIcon(effectType) {
	switch(effectType) {
		case 'Brightness': return <MdBrightness5 />
		case 'Clear': return <FaEraser />
		case 'External': return <FaCode />
		case 'GameOfLife': return <GiConwayLifeGlider />
		case 'LarsonEffect': return <FaCab />
		case 'Layer': return <FaClone />
		case 'Mirror': return <MdFlip />
		case 'RainbowEffect': return <MdLooks />
		case 'Stripe': return <FaEllipsisH />
		case 'Switch': return <MdLinearScale />
		default: return <FaSquareO />
	}
}
