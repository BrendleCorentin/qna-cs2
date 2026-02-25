
export function getFaceitLevel(elo) {
    if (elo < 800) return 1;
    if (elo <= 950) return 2;
    if (elo <= 1100) return 3;
    if (elo <= 1250) return 4;
    if (elo <= 1400) return 5;
    if (elo <= 1550) return 6;
    if (elo <= 1700) return 7;
    if (elo <= 1850) return 8;
    if (elo <= 2000) return 9;
    return 10;
}

export function getLevelColor(level) {
    // Faceit colors approx
    if (level === 1) return "#c4c4c4"; // grey
    if (level === 2) return "#c4c4c4";
    if (level === 3) return "#c4c4c4";
    if (level === 4) return "#ffc800"; // yellow
    if (level === 5) return "#ffc800";
    if (level === 6) return "#ffc800";
    if (level === 7) return "#ffc800";
    if (level === 8) return "#ff6b00"; // orange
    if (level === 9) return "#ff6b00";
    if (level === 10) return "#ff0000"; // red
    return "#c4c4c4";
}
