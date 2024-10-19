import { useEffect, useRef, useState } from "react";
import Settings from "../../services/device/Settings";
import Music from "../../services/music/Music";

// Audio visualizer from https://github.com/gg-1414/music-visualizer
var audio: HTMLAudioElement;
var ctx: CanvasRenderingContext2D;
var dataArray: Uint8Array;
var analyser: AnalyserNode;
var playViewId: number;
var barHeight: number;
var barWidth: number;
var startX = 0;
var x = 0;
var bars = 0;
var canvasWidth = 0;

function MusicVisualizerCanvas({canvasRef}: {canvasRef: React.MutableRefObject<HTMLCanvasElement>}) {
    const [dimensions, setDimensions] = useState({
        height: window.innerHeight,
        width: window.innerWidth
    });
    const { height, width } = dimensions;
    const canvas = useRef<HTMLCanvasElement>();

    const updateDimensions = () => setDimensions({height: window.innerHeight, width: window.innerWidth});

    const prepareCanvas = () => {
        canvas.current.width = window.innerWidth;
        canvas.current.height = window.innerHeight;
        if (dataArray) {
            barWidth = (window.innerWidth / analyser.frequencyBinCount) * 13;
            bars = 0;
            canvasWidth = 0;
            while (canvasWidth <= canvas.current.width) {
                if (bars >= dataArray.length)
                    break;

                canvasWidth += barWidth + 10;
                bars++;
            }
            startX = (canvas.current.width - canvasWidth)/2;
        }
    }

    useEffect(prepareCanvas, [width, height]);


    useEffect(() => {
        window.addEventListener("resize", updateDimensions);
        if (!canvas.current)
            return;

        ctx = canvas.current.getContext("2d");
        if (!Music.audioContext) {
            Music.audioContext = new AudioContext();
            if (!audio)
                audio = window.rntp.getMediaElement();
            let src = Music.audioContext.createMediaElementSource(audio);
            analyser = Music.audioContext.createAnalyser();

            src.connect(analyser);
            analyser.connect(Music.audioContext.destination);
        }

        analyser.fftSize = 16384;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        prepareCanvas();
        renderFrame();

        return () => {
            window.removeEventListener("resize", updateDimensions);
            cancelAnimationFrame(playViewId);
        };
    }, []);

    const renderFrame = () => {
        if (!canvas.current)
            return;

        playViewId = requestAnimationFrame(renderFrame);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

        let r, g, b;
        x = startX;
        for (let i = 0; i < bars; i++) {
            barHeight = dataArray[i] * 2.5;
            if (dataArray[i] > 210) {
                r = 250;
                g = 0;
                b = 255;
            } else if (dataArray[i] > 200) {
                r = 250;
                g = 255;
                b = 0;
            } else if (dataArray[i] > 190) {
                r = 204;
                g = 255;
                b = 0;
            } else if (dataArray[i] > 180) {
                r = 0;
                g = 219;
                b = 131;
            } else {
                r = 0;
                g = 199;
                b = 255;
            }
    
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, (canvas.current.height - barHeight), barWidth, barHeight);
            x += barWidth + 10;
        }
    }

    return <canvas
        ref={(ref: HTMLCanvasElement) => {
            canvas.current = ref;
            canvasRef.current = ref;
        }}
        
        style={{
            pointerEvents: "none",
            mixBlendMode: "difference",
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            opacity: 0.9,
            transition: "opacity .5s ease-in-out",
            zIndex: 2
        }}
    />;
}

export default MusicVisualizerCanvas;