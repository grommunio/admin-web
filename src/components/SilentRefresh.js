import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { refreshToken } from "../actions/auth";


const SilentRefresh = ({ children }) => {
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
    }, 1000 * 60 * 60 * 24); // Refresh every 24h
  }

  return children;
}

export default SilentRefresh;
