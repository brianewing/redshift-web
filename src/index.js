import './style';
import App from './components/app';

import FastClick from './lib/fastclick';

FastClick.attach(document.body);

// set user-scalable=no
const viewportTag = document.querySelector('meta[name=viewport]');
viewportTag.content += ',user-scalable=no';

export default App;
