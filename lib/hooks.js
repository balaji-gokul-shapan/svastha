import { useDispatch, useSelector } from "react-redux";
import {
  selectScreeningData,
  selectScreeningError,
  selectScreeningLoading,
  selectScreeningSuccess,
} from "./features/registerScreeningSlice";

export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;

// Shared screening-request state. The same hook can be used by any component
// after the existing getAllScreening thunk has been dispatched.
export function useScreeningRequests() {
  const data = useSelector(selectScreeningData);
  const loading = useSelector(selectScreeningLoading);
  const error = useSelector(selectScreeningError);
  const success = useSelector(selectScreeningSuccess);

  return { data, loading, error, success };
}

