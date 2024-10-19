import * as SecureStore from 'expo-secure-store';
import { Platform, Settings } from 'react-native';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Setting } from '../types';
import { RootState } from './store';

let initialState: Setting = {
    theme: 'auto',
    color: 'default',
    language: 'auto',
    transmitDeviceLanguage: true,
    proxy: false,
    safetyMode: false,
    visualizer: false,
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
        setSettings: (state, action: PayloadAction<Setting>) => {
            for (const key in action.payload)
                if (key in state)
                    // @ts-ignore
                    state[key] = action.payload[key];
                

            storage.setItem('settings', JSON.stringify({
                ...state,
                ...action.payload
            }));
        },
    },
});

export const selectSettings = (state: RootState) => state.settings;
export const { setSettings } = settingsSlice.actions;
export default settingsSlice.reducer;