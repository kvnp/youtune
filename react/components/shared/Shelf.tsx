import { Text, View } from "react-native";
import { resultHomeStyle } from '../../styles/Home';
import { descriptionStyle } from '../../styles/Description';
import FlatAlbums from '../collections/FlatAlbums';
import FlatEntries from '../collections/FlatEntries';
import { useTheme } from '@react-navigation/native';

export default function Shelf({ shelf, navigation }) {
    const { title, entries, subtitle, albums, description } = shelf;
    const { colors } = useTheme();

    return (
        <>
            <View style={resultHomeStyle.textView}>
                <Text style={[resultHomeStyle.homeText, {color: colors.text}]}>{title}</Text>
            </View>
            {description != undefined ? <Text style={[descriptionStyle.text, {color: colors.text}]}>{description}</Text> : null}
            {subtitle != undefined || subtitle != "" ? <Text style={{color: colors.text}}>{subtitle}</Text> : null}
            {entries != undefined ? <FlatEntries entries={entries} navigation={navigation}/> : null}
            {albums != undefined ? <FlatAlbums albums={albums} navigation={navigation}/> : null}
        </>
    );
}