import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text
} from "react-native";

import { State } from 'react-native-track-player';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";
import { Button } from "react-native-paper";

import Music from "../../services/music/Music";
import Downloads from "../../services/device/Downloads";
import Settings from "../../services/device/Settings";
import Cast from "../../services/music/Cast";
import HTTP from "../../services/api/HTTP";

import { insertBeforeLast } from "../../utils/Navigation";
import SeekBar from "../../components/player/SeekBar";
import SwipePlaylist from "../../components/player/SwipePlaylist";
import { showModal } from "../../components/modals/MoreModal";
import ScrollingText from "../../components/shared/ScrollingText";
import CastButton from "../../components/player/CastButton";
import MusicVisualizerCanvas from "../../components/player/MusicVisualizerCanvas";

var firstPoint = 0;
var clientY = 0;

var firstImageX = 0;
var firstImageY = 0;
var imageX = 0;
var imageY = 0;
var passMovement = false;
var horizontalLocked = false;

var imageWorker = new Worker("/public/image/worker.js");
var imgColors = null;

export default function PlayView({ route, navigation }) {
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  });
  const { height, width } = dimensions;
  const { dark, colors } = useTheme();
  const image = useRef<HTMLCanvasElement>(null);
  const [imageColors, setImageColors] = useState(imgColors);
  const fontColor = imageColors ? imageColors.fontHex : colors.text;
  const buttonColor = imageColors ? imageColors.buttonHex : colors.card;
  const thumbColor = imageColors ? imageColors.thumbHex : colors.primary;

  const [pointerDisabled, setPointerDisabled] = useState(false);
  const heightTransition = "height .4s cubic-bezier(.175, .885, .32, 1.275), opacity .1s";
  const imageTransition = "transform .4s cubic-bezier(.175, .885, .32, 1.275)";
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const vertContainer = useRef<HTMLDivElement>(null);
  const background = useRef<HTMLDivElement>(null);

  const [state, setState] = useState(Music.state);
  const [track, setTrack] = useState(Music.metadata);
  const [list, setList] = useState(Music.list);
  const [repeat, setRepeat] = useState(Music.repeatModeString);
  const [connected, setConnected] = useState(Music.isStreaming);
  const [isLiked, setLiked] = useState<boolean | null>(null);

  const { videoId, playlistId, title, artist, artwork } = track;


  const likeSong = (like: boolean | null) => {
    Downloads.likeTrack(videoId, like);
    setLiked(like);
  }

  const updateDimensions = () => {
    setDimensions({
      height: window.innerHeight,
      width: window.innerWidth
    });
    drawImage();
  }

  const handlePlayback = () => {
    if (!title) {
      setState(State.Buffering);
      Music.handlePlayback({
        videoId: route.params.v,
        playlistId: route.params.list
      });
    }
  }

  const goBack = () => {
    container.current!.style.transition = heightTransition;
    container.current!.style.height = "0px";
    container.current!.ontransitionend = () => {
      if (!navigation.canGoBack())
        navigation.dispatch(insertBeforeLast("App"));
      navigation.navigate("App");
    }
  }

  const handleMovement = value => {
    container.current!.style.transition = "";
    setPointerDisabled(true);
    if (firstPoint == 0)
      firstPoint = value;
    clientY = value;

    let newHeight = (window.innerHeight - (clientY - firstPoint));
    let newOpacity = newHeight / window.innerHeight;
    container.current!.style.height = newHeight + "px";
    container.current!.style.opacity = newOpacity + "";
  };

  const handleTouch = e => handleMovement(e.touches[0].clientY);
  const handleMouse = e => {
    if (e.nativeEvent.target.getAttribute("role") == "slider")
      return;

    handleMovement(e.clientY);
  }

  const stopMovement = () => {
    setPointerDisabled(false);
    let diff = (window.innerHeight - (clientY - firstPoint)) / window.innerHeight;
    container.current!.style.transition = heightTransition;
    firstPoint = 0;
    clientY = 0;

    firstImageX = 0;
    firstImageY = 0;
    imageX = 0;
    imageY = 0;
    passMovement = false;
    if (diff < .5)
      return goBack();

    if (diff > 1.25 && !Music.isStreaming)
      Cast.cast();

    if (horizontalLocked) {
      if (Number(image.current!.style.opacity) <= .5) {
        image.current!.style.transition = imageTransition;
        image.current!.ontransitionend = e => image.current!.style.transition = "";
        let firstLetter = image.current!.style.transform[11];
        let newTranslate = -Number(image.current!.style.transform.slice(11, -3));
        image.current!.style.transform = "translateX(" + newTranslate + "px)";
        if (firstLetter == "-")
          Music.skipNext();
        else
          Music.skipPrevious();
      }

      horizontalLocked = false;
    }

    container.current!.style.height = "100%";
    image.current!.style.transform = "translateX(0px)";
    image.current!.style.opacity = 1 + "";
    container.current!.style.opacity = 1 + "";
  }

  const handleImage = e => {
    let iX;
    let iY;
    if (e instanceof TouchEvent) {
      iX = e.touches[0].clientX;
      iY = e.touches[0].clientY;
    } else {
      iX = e.clientX;
      iY = e.clientY;
    }

    if (passMovement) {
      if (horizontalLocked)
        moveImage(iX);
      else
        handleMovement(iY);
      return;
    }

    if (!firstImageX) {
      firstImageX = iX;
      firstImageY = iY;
    }

    imageX = iX;
    imageY = iY;

    let xMovement = firstImageX - imageX;
    let yMovement = firstImageY - imageY;

    if (Math.abs(xMovement) >= 10) {
      passMovement = true;
      horizontalLocked = true;
      return;
    }

    if (Math.abs(yMovement) >= 10) {
      passMovement = true;
      horizontalLocked = false;
    }
  }

  const moveImage = value => {
    let newTranslate = value - firstImageX;
    let newOpacity = (image.current!.width - Math.abs(newTranslate)) / image.current!.width;
    image.current!.style.transform = "translateX(" + newTranslate + "px)";
    image.current!.style.opacity = newOpacity + "";
  }

  const enableImage = () => image.current!.addEventListener("mousemove", handleImage);;
  const disableImage = () => image.current!.removeEventListener("mousemove", handleImage);;
  const enableMovement = () => background.current!.addEventListener("mousemove", handleMouse);
  const disableMovement = () => background.current!.removeEventListener("mousemove", handleMouse);
  const darkenCanvas = () => canvas.current!.style.opacity = .3 + "";
  const restoreCanvas = () => canvas.current!.style.opacity = .9 + "";

  useEffect(() => {
    container.current!.style.height = "100%";
    background.current!.style.transition = "background-color .4s";
    background.current!.style.backgroundColor = imageColors ? imageColors.imageHex : dark ? "black" : "white";
    vertContainer.current!.addEventListener("mouseover", darkenCanvas);
    vertContainer.current!.addEventListener("mouseleave", restoreCanvas);
    vertContainer.current!.addEventListener("touchstart", darkenCanvas);
    vertContainer.current!.addEventListener("touchend", restoreCanvas);

    background.current!.addEventListener("touchmove", handleTouch);
    background.current!.addEventListener("touchend", stopMovement);
    background.current!.addEventListener("mousedown", enableMovement);
    background.current!.addEventListener("mouseout", disableMovement);
    background.current!.addEventListener("mouseup", () => { disableMovement(); stopMovement() });

    image.current!.addEventListener("touchmove", handleImage);
    image.current!.addEventListener("touchend", stopMovement);
    image.current!.addEventListener("mousedown", enableImage);
    image.current!.addEventListener("mouseout", disableImage);
    image.current!.addEventListener("mouseup", () => { disableImage(); stopMovement() });

    document.addEventListener("mouseleave", stopMovement);
    window.addEventListener("resize", updateDimensions);
    return () => {
      document.removeEventListener("mouseleave", stopMovement);
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (videoId != null) {
      navigation.setOptions({ title: title });
      let object = videoId.includes("&")
        ? { v: videoId.slice(0, videoId.indexOf("&")), list: playlistId }
        : { v: videoId, list: playlistId };

      navigation.setParams(object);
      Downloads.isTrackLiked(videoId).then(like => setLiked(like));
    }
  }, [videoId, playlistId]);

  useEffect(() => {
    if (Settings.initialized)
      handlePlayback();
    else
      Settings.waitForInitialization().then(handlePlayback);

    const castListener = Cast.addListener(
      Cast.EVENT_CAST,
      e => {
        if (e.castState == "CONNECTED")
          setConnected(true);
        else
          setConnected(false);
      }
    )

    const stateListener = Music.addListener(
      Music.EVENT_STATE_UPDATE,
      e => setState(e)
    );

    const metadataListener = Music.addListener(
      Music.EVENT_METADATA_UPDATE,
      metadata => setTrack(metadata)
    );

    const listListener = Music.addListener(
      Music.EVENT_QUEUE_UPDATE,
      list => setList(list)
    );

    const lkListener = Downloads.addListener(
      Downloads.EVENT_LIKE,
      like => setLiked(like)
    );

    imageWorker.onmessage = event => {
      background.current!.style.backgroundColor = event.data.imageHex;
      imgColors = event.data;
      setImageColors(event.data);
    };

    return () => {
      castListener.remove();
      stateListener.remove();
      metadataListener.remove();
      listListener.remove();
      lkListener.remove();
    }
  }, []);

  const drawImage = () => {
    image.current!.style.width = height / 2.6 + "px";
    image.current!.width = height / 2.6;
    image.current!.height = height / 2.6;

    const ctx = image.current!.getContext(
      "2d", {willReadFrequently: true}
    );
    const img = tempImg.current;

    var hRatio = image.current!.width / img.width;
    var vRatio = image.current!.height / img.height;
    var ratio = Math.min(hRatio, vRatio);
    var centerShift_x = (image.current!.width - img.width * ratio) / 2;
    var centerShift_y = (image.current!.height - img.height * ratio) / 2;
    ctx!.clearRect(0, 0, image.current!.width, image.current!.height);
    ctx!.drawImage(
      img, 0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
    );

    let pixels = ctx!.getImageData(0, 0, image.current!.width, image.current!.height);
    imageWorker.postMessage({
      pixels: pixels.data.buffer,
      width: image.current!.width,
      height: image.current!.height
    }, [pixels.data.buffer]);
  };


  const tempImg = useRef<HTMLImageElement>(new Image());

  useEffect(() => {
    tempImg.current.crossOrigin = "Anonymous";
    tempImg.current.onload = drawImage;
    tempImg.current.onerror = () => tempImg.current.src = HTTP.getProxyUrl(artwork);
  }, []);


  useEffect(() => {
    if (artwork && image.current)
      tempImg.current.src = artwork;
  }, [artwork]);


  useEffect(() => {
    image.current?.addEventListener("load", () => { console.log("load") });
    image.current?.addEventListener("error", () => { console.log("error") });
  }, []);

  return <View
    ref={container}
    style={{
      pointerEvents: "none",
      position: "fixed",
      width: "100%",
      height: "0px",
      bottom: 0,
      overflow: "hidden",
      transition: "height .4s,opacity .1s"
    }}
  >
    <MusicVisualizerCanvas
      canvasRef={canvas}
    />
    <div
      ref={background}
      id="background"
      style={{
        pointerEvents: "auto",
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0
      }}
    />
    <View
      ref={vertContainer}
      style={[
        stylesTop.vertContainer,
        {
          pointerEvents: "none",
          zIndex: 2,
          flexDirection: "column"
        }
      ]}
    >
      <View
        style={[
          imageStyles.view,
          {
            maxWidth: "100%",
            alignItems: "center",
          }
        ]}
      >
        <canvas
          ref={image}
          draggable="false"
          style={{
            pointerEvents: "auto",
            ...imageStyles.image
          }}
        />
      </View>

      <View
        style={[
          stylesBottom.container,
          {
            pointerEvents: "none",
            width: width - 50,
            height: height / 2.6
          }
        ]}
      >
        <View
          style={[
            controlStyles.container,
            {
              pointerEvents: "none"
            }
          ]}
        >
          <Button
            onPress={() => likeSong(false)}
            labelStyle={{ marginHorizontal: 0 }}
            style={{
              pointerEvents: pointerDisabled ? "none" : "auto",
              borderRadius: 25,
              alignItems: "center",
              padding: 0,
              margin: 0,
              minWidth: 0
            }}
            contentStyle={{
              alignItems: "center",
              width: 50,
              height: 50,
              minWidth: 0
            }}
          >
            <MaterialIcons
              name="thumb-down"
              selectable={false}
              size={30}
              style={{
                textAlignVertical: "center",
                lineHeight: 30
              }}
              color={
                isLiked == null
                  ? "dimgray"
                  : !isLiked
                    ? fontColor
                    : "dimgray"
              }
            />
          </Button>

          <View
            style={[{
              flexGrow: 1,
              width: 1,
              paddingHorizontal: 5,
              alignItems: "center",
              userSelect: "text",
              overflow: "hidden"
            }]}
          >
            <ScrollingText>
              <Text
                numberOfLines={1}
                style={[
                  stylesBottom.titleText,
                  {
                    pointerEvents: pointerDisabled
                      ? "none"
                      : "auto",
                    color: fontColor
                  }
                ]}
              >
                {title}
              </Text>
            </ScrollingText>

            <ScrollingText>
              <Text
                numberOfLines={1}
                style={[
                  stylesBottom.subtitleText,
                  {
                    pointerEvents: pointerDisabled
                      ? "none"
                      : "auto",
                    color: fontColor
                  }
                ]}
              >
                {artist}
              </Text>
            </ScrollingText>
          </View>

          <Button
            onPress={() => likeSong(true)}
            labelStyle={{
              marginHorizontal: 0
            }}
            style={{
              padding: 0,
              margin: 0,
              minWidth: 0,
              borderRadius: 25,
              alignItems: "center",
              pointerEvents: pointerDisabled
                ? "none"
                : "auto",
            }}
            contentStyle={{
              alignItems: "center",
              width: 50,
              height: 50,
              minWidth: 0
            }}
          >
            <MaterialIcons
              name="thumb-up"
              size={30}
              selectable={false}
              style={{
                textAlignVertical: "center",
                lineHeight: 30
              }}
              color={
                isLiked == null
                  ? "dimgray"
                  : isLiked
                    ? fontColor
                    : "dimgray"
              }
            />
          </Button>
        </View>

        <SeekBar
          buffering={state}
          buttonColor={buttonColor}
          thumbColor={thumbColor}
          fontColor={fontColor}
          style={{
            pointerEvents: pointerDisabled
              ? "none"
              : "auto"
          }}
        />

        <View
          style={[
            stylesBottom.buttonContainer,
            {
              pointerEvents: "none",
              overflow: "visible",
              alignSelf: "stretch",
              justifyContent: "space-between"
            }
          ]}
        >
          <CastButton
            color={fontColor}
            labelStyle={{
              marginHorizontal: 0
            }}
            style={{
              pointerEvents: pointerDisabled
                ? "none"
                : "auto",
              borderRadius: 25,
              alignItems: "center",
              padding: 0,
              margin: 0,
              minWidth: 0
            }}
            contentStyle={{
              alignItems: "center",
              width: 50,
              height: 50,
              minWidth: 0
            }}
            iconStyle={{
              textAlignVertical: "center",
              lineHeight: 30
            }}
          />

          <Button
            onPress={Music.skipPrevious}
            labelStyle={{
              marginHorizontal: 0
            }}
            style={{
              pointerEvents: pointerDisabled
                ? "none"
                : "auto",
              borderRadius: 25,
              alignItems: "center",
              padding: 0,
              margin: 0,
              minWidth: 0
            }}
            contentStyle={{
              alignItems: "center",
              width: 50,
              height: 50,
              minWidth: 0
            }}
          >
            <MaterialIcons
              selectable={false}
              name="skip-previous"
              color={fontColor}
              size={40}
              style={{
                textAlignVertical: "center"
              }}
            />
          </Button>

          <View
            style={{
              pointerEvents: pointerDisabled
                ? "none"
                : "auto",
              alignSelf: "center",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: buttonColor,
              width: 60,
              height: 60,
              borderRadius: 30
            }}
          >
            {state == State.Buffering
              ? <ActivityIndicator
                color={fontColor}
                size="large"
                style={{
                  alignSelf: "center"
                }}
              />

              : <Button
                onPress={
                  state == State.Playing
                    ? Music.pause
                    : Music.play
                }
                style={{
                  borderRadius: 25,
                  alignItems: "center",
                  padding: 0,
                  margin: 0,
                  minWidth: 0
                }}
                contentStyle={{
                  alignItems: "center",
                  width: 60,
                  height: 60,
                  minWidth: 0
                }}
                labelStyle={{
                  marginHorizontal: 0
                }}
                
              >
                <MaterialIcons
                  name={
                    state == State.Playing
                      ? "pause"
                      : "play-arrow"
                  }
                  selectable={false}
                  color={fontColor}
                  size={40}
                  style={{
                    textAlignVertical: "center"
                  }}
                />
              </Button>
            }
          </View>

          <Button
            onPress={Music.skipNext}
            labelStyle={{
              marginHorizontal: 0
            }}
            style={{
              pointerEvents: pointerDisabled
                ? "none"
                : "auto",
              borderRadius: 25,
              alignItems: "center",
              padding: 0,
              margin: 0,
              minWidth: 0
            }}
            contentStyle={{
              alignItems: "center",
              width: 50,
              height: 50,
              minWidth: 0
            }}
          >
            <MaterialIcons
              selectable={false}
              name="skip-next"
              color={fontColor}
              size={40}
              style={{
                textAlignVertical: "center"
              }}
            />
          </Button>

          <Button
            onPress={() => setRepeat(Music.cycleRepeatMode())}
            disabled={connected}
            labelStyle={{
              marginHorizontal: 0
            }}
            style={{
              pointerEvents: pointerDisabled
                ? "none"
                : "auto",
              borderRadius: 25,
              alignItems: "center",
              padding: 0,
              margin: 0,
              minWidth: 0
            }}
            contentStyle={{
              alignItems: "center",
              width: 50,
              height: 50,
              minWidth: 0
            }}
          >
            <MaterialIcons
              name={
                !Music.isStreaming
                  ? repeat
                  : "repeat-one-on"
              }
              color={fontColor}
              selectable={false}
              size={30}
              style={{
                textAlignVertical: "center"
              }}
            />
          </Button>
        </View>

        <View
          style={{
            pointerEvents: "none",
            justifyContent: "space-between",
            flexDirection: "row",
            paddingTop: 30
          }}
        >
          <Button
            onPress={goBack}
            labelStyle={{
              marginHorizontal: 0
            }}
            style={{
              pointerEvents: pointerDisabled
                ? "none"
                : "auto",
              borderRadius: 25,
              alignItems: "center",
              padding: 0,
              margin: 0,
              minWidth: 0
            }}
            contentStyle={{
              alignItems: "center",
              width: 50,
              height: 50,
              minWidth: 0
            }}
          >
            <MaterialIcons
              selectable={false}
              name="keyboard-arrow-down"
              color={fontColor}
              size={30}
              style={{
                textAlignVertical: "center"
              }}
            />
          </Button>

          <Button
            onPress={() => showModal({
              title: title,
              subtitle: artist,
              thumbnail: artwork,
              videoId: videoId
            })}
            labelStyle={{
              marginHorizontal: 0
            }}
            style={[
              stylesTop.topThird,
              {
                pointerEvents: pointerDisabled
                  ? "none"
                  : "auto",
                borderRadius: 25,
                alignItems: "center",
                padding: 0,
                margin: 0,
                minWidth: 0
              }
            ]}
            contentStyle={{
              alignItems: "center",
              width: 50,
              height: 50,
              minWidth: 0
            }}
          >
            <MaterialIcons
              name="more-vert"
              selectable={false}
              color={fontColor}
              size={30}
              style={{
                textAlignVertical: "center"
              }}
            />
          </Button>
        </View>
      </View>
    </View>

    <SwipePlaylist
      track={track}
      playlist={list}
      minimumHeight={50}
      textColor={fontColor}
      backgroundColor={buttonColor}
      style={{
        zIndex: 2,
        pointerEvents: pointerDisabled
          ? "none"
          : "auto"
      }}
    />
  </View>
}

const stylesBottom = StyleSheet.create({
  container: {
    alignSelf: "center",
    alignItems: "stretch",
    justifyContent: "center",
    minWidth: "50%",
    maxWidth: 400,
    paddingHorizontal: "5%"
  },

  subtitleText: {
    paddingTop: "1%",
    alignSelf: "center",
    textAlign: "center"
  },

  titleText: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center"
  },

  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    paddingTop: 20
  }
});

const imageStyles = StyleSheet.create({
  view: {
    alignSelf: "center",
    width: "auto",
    maxWidth: 400
  },

  image: {
    flex: 1
  }
});

const controlStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});


const stylesTop = StyleSheet.create({
  topSecond: {
    flexDirection: "row",
    backgroundColor: "brown",
  },

  topSecondTextOne: {
    fontWeight: "bold",
    color: "white",
  },

  topSecondTextTwo: {
    fontWeight: "bold",
    color: "white",
  },

  vertContainer: {
    width: "100%",
    height: "100%",
    paddingHorizontal: "10%",
    paddingBottom: 60,
    alignSelf: "center",
    alignContent: "space-around",
    justifyContent: "space-around"
  }
});