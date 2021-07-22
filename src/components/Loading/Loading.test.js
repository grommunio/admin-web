// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React from 'react';
import ReactDOM from 'react-dom';

import Loading from './Loading';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Loading />, div);
  ReactDOM.unmountComponentAtNode(div);
});
