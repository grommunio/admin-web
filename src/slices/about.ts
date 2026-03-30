// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { createApiThunk } from '../actions/handlers';
import { get } from '../api';
import { createSlice } from '@reduxjs/toolkit'

type AboutState = {
  API: string,
  backend: string,
  schema: number,
}

const initialState: AboutState = {
  API: '69.42.0',
  backend: '1.3.3.7',
  schema: 69,
};

type AboutResponse = {
  "API": string,
  "backend": string,
  "schema": number;
}

export const fetchAboutData = createApiThunk<
  AboutResponse
>(
  'about/fetch',
  () => get('/about')
);

const aboutSlice = createSlice({
  name: "about",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAboutData.fulfilled, (state, action) => {
        state.API = action.payload.API ?? '';
        state.backend = action.payload.backend ?? '';
        state.schema = action.payload.schema ?? 0;
      });
  },
});

const aboutReducer =  aboutSlice.reducer;
export default aboutReducer;
