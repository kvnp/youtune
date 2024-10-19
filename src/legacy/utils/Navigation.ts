import { CommonActions } from '@react-navigation/native';

// https://reactnavigation.org/docs/navigation-prop/#dispatch
export const insertBeforeLast = (routeName, params) => state => {
    const routes = [
        ...state.routes.slice(0, -1),
        { name: routeName, params },
        state.routes[state.routes.length - 1],
    ];

    return CommonActions.reset({
        ...state,
        routes,
        index: routes.length - 1,
    });
};