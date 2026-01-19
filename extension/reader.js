export function getORPIndex(word) {
    const length = word.length;
    if (length <= 1) return 0;
    if (length <= 5) return 1;
    if (length <= 9) return 2;
    if (length <= 13) return 3;
    return 4;
}

export function splitText(text) {
    // Split by whitespace
    const tokens = text.trim().split(/\s+/).filter(w => w.length > 0);
    
    // Post-processing to attach isolated punctuation to previous word (common in French)
    // e.g. ["Salut", "!", "Ça", "va", "?"] -> ["Salut !", "Ça", "va ?"]
    const processed = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const isPunctuation = /^[!?;:,.]+$/.test(token);
        
        if (isPunctuation && processed.length > 0) {
            processed[processed.length - 1] += " " + token;
        } else {
            processed.push(token);
        }
    }
    return processed;
}

export function generateWordHTML(word, orpIndex) {
    const prefix = word.substring(0, orpIndex);
    const orpChar = word[orpIndex];
    const suffix = word.substring(orpIndex + 1);
    
    return `<span class="word-prefix">${prefix}</span><span class="word-orp">${orpChar}</span><span class="word-suffix">${suffix}</span>`;
}
