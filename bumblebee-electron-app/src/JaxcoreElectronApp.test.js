import React from 'react';
import ReactDOM from 'react-dom';
import JaxcoreElectronApp from './JaxcoreElectronApp';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<JaxcoreElectronApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
