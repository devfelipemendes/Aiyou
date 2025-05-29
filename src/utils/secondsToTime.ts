export function secondsToTime(seconds: string | number) {

    const secondsInNumber = parseInt(seconds.toString());

    const h = Math.floor(secondsInNumber / 3600).toString().padStart(2, '0');
    const m = Math.floor(secondsInNumber % 3600 / 60).toString().padStart(2, '0');
    const s = Math.floor(secondsInNumber % 60).toString().padStart(2, '0');

    return `${h}:${m}:${s}`;
}