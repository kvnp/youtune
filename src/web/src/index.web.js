import { AppRegistry } from 'react-native'
import iconFont from 'react-native-vector-icons/Fonts/MaterialIcons.ttf';

import { name } from '../../react/app.json'
import App from '../../react/App'

const styles = `@font-face{
    src: url(${iconFont});
    font-family: MaterialIcons;
}`;

const style = document.createElement('style');
style.rel = "stylesheet";
style.appendChild(document.createTextNode(styles));
document.head.appendChild(style);

AppRegistry.registerComponent(name, () => App);
AppRegistry.runApplication(name, {
    rootTag: document.getElementById('app'),
});