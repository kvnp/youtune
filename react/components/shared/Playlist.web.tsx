import { Text } from "react-native";
import { useTheme } from '@react-navigation/native';
import { TouchableRipple } from 'react-native-paper';

import HTTP from "../../services/api/HTTP";
import Navigation from '../../services/ui/Navigation';

import { showModal } from '../modals/MoreModal';
import { playlistStyle } from '../../styles/Playlist';

export default function Playlist({ playlist, navigation, style, onPress }) {
    let { title, subtitle, thumbnail, placeholder,
          videoId, browseId, playlistId } = playlist;

    let view = {
        title: title,
        subtitle: subtitle,
        thumbnail: thumbnail,
        videoId: videoId,
        browseId: browseId,
        playlistId: playlistId
    };

    const { colors } = useTheme();

    return (
        <TouchableRipple
            rippleColor={colors.primary}
            onLongPress={() => showModal(view)}
            onPress={
                onPress
                    ? () => onPress()
                    : () => {
                        Navigation.transitionPlaylist = {
                            playlistId: playlistId,
                            browseId: browseId,
                            title: title,
                            thumbnail: thumbnail
                        }
                        Navigation.handleMedia(view, false, navigation);
                    }
            }
            style={[style, playlistStyle.container]}
        >
            <>
            {
                placeholder
                    ? <Text style={[playlistStyle.cover, {color: colors.text, textAlign: "center", fontSize: 100}]}>{placeholder}</Text>
                    : <div style={playlistStyle.cover}>
                        <img
                            src={thumbnail}
                            draggable="false"
                            loading="lazy"
                            onLoad={e => e.target.style.opacity = 1}
                            onError={(e) => {
                                let self: JSX.IntrinsicElements["img"] = e.target;
                                self.src = HTTP.getProxyUrl(thumbnail);
                            }}
                            style={{objectFit: "cover", width: "100%", height: "100%", opacity: 0, transition: "opacity .4s ease-in"}}
                        >

                        </img>
                    </div>
            }
            

            <Text style={[playlistStyle.title, {color: colors.text}]} numberOfLines={2}>
                {title}
            </Text>

            <Text style={[playlistStyle.description, {color: colors.text}]} numberOfLines={2}>
                {subtitle}
            </Text>
            </>
        </TouchableRipple>
    );
}