export function msToMin(ms) {
    return ~~((ms / 1000 / 60) % 60);
}

export function msToMMSS(ms) {
    const seconds = ~~((ms / 1000) % 60);
    const minutes = msToMin(ms);

    let secondString = seconds + "";
    if (secondString.length == 1) secondString = "0" + secondString;
    
    return minutes + ":" + secondString;
}

export function textToSec(text) {
    let array = text.split(":");

    let hours;
    let minutes;
    let seconds;

    if (array.length == 3) {
        hours = Number.parseInt(array[0] * 3600);
        minutes = Number.parseInt(array[1]) * 60;
        seconds = Number.parseInt(array[2]);
    } else {
        hours = 0;
        minutes = Number.parseInt(array[0]) * 60;
        seconds = Number.parseInt(array[1]);
    }

    return minutes + seconds + hours;
}

