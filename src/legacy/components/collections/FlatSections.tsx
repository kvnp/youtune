import { FlatList } from "react-native";
import Section from './Section';
import { HomeSection } from "ytmusic-api";

export default function FlatSections(
    {sections, navigation, type}:
    {sections: HomeSection[], navigation: any, type: string}) {
    return <FlatList
        keyExtractor={item => item.title}
        refreshing={false}
        data={sections}
        renderItem={
            ({item}) => <Section
                section={item}
                type={type}
                navigation={navigation}
            />
        }
        contentContainerStyle={{
            marginHorizontal: "auto",
            position: "absolute",
            width: "100%"
        }}
    />
}