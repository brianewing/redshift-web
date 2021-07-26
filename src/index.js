import './style';
import './lib/redshift-wasm';

// import 'es6-shim';

import App from './components/app';

import basicContext from 'basiccontext';

import FastClick from './lib/fastclick';
import preventDragClickEvents from './lib/prevent-drag-click-events';

FastClick.attach(document.body);
// preventDragClickEvents(document.body);

// set user-scalable=no
const viewportTag = document.querySelector('meta[name=viewport]');
viewportTag.content += ',user-scalable=no';

const _basicContextShow = basicContext.show

const redshiftWasm = new RedshiftWasm

// patch basicContext to vibrate when a context menu is shown
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
