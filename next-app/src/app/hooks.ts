import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { AppState, AppDispatch } from "./store"

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector