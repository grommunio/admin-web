// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  MEMBERS_DATA_ERROR,
  MEMBERS_DATA_FETCH,
  MEMBERS_DATA_RECEIVED,
} from '../actions/types';
import { members, addMember, editMember, deleteMember } from '../api';

export function fetchMembersData() {
  return async dispatch => {
    await dispatch({ type: MEMBERS_DATA_FETCH });
    try {
      const response = await dispatch(members());
      await dispatch({ type: MEMBERS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: MEMBERS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function addMemberData(member) {
  return async dispatch => {
    try {
      await dispatch(addMember(member));
    } catch(error) {
      await dispatch({ type: MEMBERS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function editMemberData(member) {
  return async dispatch => {
    try {
      await dispatch(editMember(member));
    } catch(error) {
      await dispatch({ type: MEMBERS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function deleteMemberData(id) {
  return async dispatch => {
    try {
      await dispatch(deleteMember(id));
    } catch(error) {
      await dispatch({ type: MEMBERS_DATA_ERROR, error});
      console.error(error);
    }
  };
}
