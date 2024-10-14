import { useEffect, useState } from "react";
import {
    ScrollView,
    Text,
    View
} from "react-native";

import { Button } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function Artists({ navigation }) {
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
        });

        return () => unsubscribe();
    }, []);

    const {dark, colors} = useTheme();

    return entries.length == 0
        ? <View style={{height: 300, justifyContent: "space-evenly", alignItems: "center", marginTop: "auto"}}>
            <MaterialIcons name="person" color={colors.text} size={50}/>
            <Text style={{fontSize: 20, color: colors.text}}>Liked artists are displayed here</Text>
            
            <Button
                mode="outlined"
                onPress={() => navigation.navigate("Search")}
            >
                Look for music
            </Button>
        </View>
        : <ScrollView
            contentContainerStyle={{flex: 1, alignItems: "center", justifyContent: "center"}}
        >
        
    </ScrollView>
}