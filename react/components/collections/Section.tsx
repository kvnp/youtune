import { FlatList, Text, View } from "react-native";
import { resultHomeStyle } from '../../styles/Home';
import { useTheme } from '@react-navigation/native';
import { HomeSection, SearchResult } from "ytmusic-api";
import { albumStyle } from '../../styles/Home';
import Entry from "../shared/Entry";
import Playlist from "../shared/Playlist";

type SectionProps = {
  section: HomeSection;
  navigation: any;
  type: string;
}

export default function Section({ section, navigation, type }: SectionProps) {
  const { title, contents } = section;
  const { colors } = useTheme();

  return <>
    <View style={resultHomeStyle.textView}>
      <Text style={[resultHomeStyle.homeText, { color: colors.text }]}>{title}</Text>
    </View>

    {
      type == "vertical"
        ? <FlatList
          data={contents}
          keyExtractor={(item: { name: SearchResult; }) => item.name}
          renderItem={({ item, index }) =>
            <Entry
              entry={item}
              index={index + 1}
              navigation={navigation}
            />
          }

          contentContainerStyle={{
            marginHorizontal: 10,
            alignSelf: "center",
            maxWidth: 800,
            width: "100%"
          }}
        />
        : <FlatList
          style={albumStyle.albumCollection}
          horizontal={true}
          data={contents}
          renderItem={
            ({ item, index }) =>
              <Playlist
                key={index}
                entry={item}
                navigation={navigation}
                style={albumStyle.album}
              />
          }
        />
    }
  </>;
}