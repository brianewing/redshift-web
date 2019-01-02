import './style';
import App from './components/app';

import basicContext from 'basiccontext';
import FastClick from './lib/fastclick';

FastClick.attach(document.body);

// set user-scalable=no
const viewportTag = document.querySelector('meta[name=viewport]');
viewportTag.content += ',user-scalable=no';

const _basicContextShow = basicContext.show

basicContext.show = (...args) => {
	// document.getElementById("main").classList.add("shade")
	navigator.vibrate && navigator.vibrate(20)
	_basicContextShow.apply(basicContext, args)
}

// document.body.addEventListener('click', () => {
// 	setTimeout(() => {
// 		if(!basicContext.visible())
// 			document.getElementById("main").classList.remove("shade")
// 	}, 0)
// })

export default App;
