import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createSlice } from '@reduxjs/toolkit';

import { Setting } from '../types';
import { RootState } from './store';

let initialState: Setting = {
    theme: 'auto',
    color: 'default',
    language: 'auto',
};

const storage = Platform.OS !== 'web' ? SecureStore : localStorage;
let settings = storage.getItem('settings');

if (settings !== null)
    initialState = { ...initialState, ...JSON.parse(settings) };
else
    storage.setItem('settings', JSON.stringify(initialState));


const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;

            storage.setItem('settings', JSON.stringify({
                theme: action.payload,
                color: state.color,
                language: state.language,
            }));
        },

        setColor: (state, action) => {
            state.color = action.payload;

            storage.setItem('settings', JSON.stringify({
                theme: state.theme,
                color: action.payload,
                language: state.language,
            }));
        },

        setLanguage: (state, action) => {
            state.language = action.payload;

            storage.setItem('settings', JSON.stringify({
                theme: state.theme,
                color: state.color,
                Language: action.payload,
            }));
        },

        setSettings: (state, action) => {
            state.theme = action.payload.theme;
            state.color = action.payload.color;
            state.language = action.payload.language;

            storage.setItem('settings', JSON.stringify({
                theme: action.payload.theme,
                color: action.payload.color,
                language: action.payload.language,
            }));
        }
    },
});

export const selectSettings = (state: RootState) => state.settings;
export const { setTheme, setColor, setLanguage, setSettings } = settingsSlice.actions;
export default settingsSlice.reducer;