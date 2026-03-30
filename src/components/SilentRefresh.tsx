// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useRef } from "react";
import { refreshToken } from "../actions/auth";
import { useAppSelector, useAppDispatch } from "../store";


const SilentRefresh = (): React.JSX.Element | null => {
  const config = useAppSelector((state) => state.config);
  const dispatch = useAppDispatch();
  const fetchInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    refresh();

    return () => {
      if (fetchInterval.current) {
        clearInterval(fetchInterval.current);
      }
    };
  }, []);

  const refresh = () => {
    fetchInterval.current = setInterval(() => {
      console.info("token refreshed");
      dispatch(refreshToken()).catch(() =>
        console.info("Failed to refresh token")
      );
    }, 1000 * (config.tokenRefreshInterval || 60 * 60 * 24));
  };

  return null;
}

export default SilentRefresh;
