import './style';
import App from './components/app';

import FastClick from './lib/fastclick';

FastClick.attach(document.body);

(function setUserScalable(yesOrNo) {
	const viewportTag = document.querySelector('meta[name=viewport]');
	viewportTag.content += `,user-scalable=${yesOrNo}`;
})('no');

export default App;
