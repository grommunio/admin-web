// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { refreshToken } from "../actions/auth";


const SilentRefresh = ({ children }) => {
  const config = useSelector((state) => state.config);
  const dispatch = useDispatch();
  let fetchInterval = null;

  useEffect(() => {
    refresh();
    return () => {
      clearInterval(fetchInterval);
    }
  }, [])

  const refresh = () => {
    fetchInterval = setInterval(() => {
      console.info("token refreshed");
      dispatch(refreshToken()).catch(() => console.info("Failed to refresh token"));
    }, 1000 * (config.tokenRefreshInterval || 60 * 60 * 24)); // Default: 24h
  }

  return children;
}

export default SilentRefresh;
