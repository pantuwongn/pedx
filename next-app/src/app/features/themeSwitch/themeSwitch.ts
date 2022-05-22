import { AppState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoaderState {
  isThemeLight: boolean;
}

const initialState: LoaderState = {
  isThemeLight: true,
};

export const loaderSlice = createSlice({
  name: "loader",
  initialState,
  reducers: {
    setIsThemeLight: (state, action: PayloadAction<boolean>) => {
      state.isThemeLight = action.payload;
    },
  },
});

export const { setIsThemeLight } = loaderSlice.actions;

export const isThemeLight = (state: AppState) => state.themeSwitch.isThemeLight;

export default loaderSlice.reducer;
