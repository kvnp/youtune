import { Text, Surface } from "react-native-paper";
import { FlatList } from "react-native";
import { resultHomeStyle } from '../../styles/Home';
import { HomeSection } from "ytmusic-api";
import { albumStyle } from '../../styles/Home';
import Entry from "../shared/Entry";
import Playlist from "../shared/Playlist";

type SectionProps = {
    section: HomeSection;
    type: string;
}

export default function Section({ section, type }: SectionProps) {
    const { title, contents } = section;

    return <Surface>
        <Text
            style={resultHomeStyle.homeText}
        >
            {title}
        </Text>

        {
            type == "vertical"
                ? <FlatList
                    data={contents}
                    renderItem={({ item, index }) =>
                        <Entry
                            entry={item}
                            index={index + 1}
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
                    showsHorizontalScrollIndicator={false}
                    data={contents}
                    renderItem={
                        ({ item, index }) =>
                            <Playlist
                                key={index}
                                entry={item}
                                style={albumStyle.album}
                            />
                    }
                />
        }
    </Surface>;
}