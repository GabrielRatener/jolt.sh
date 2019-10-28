
const {execSync} = require('child_process');

const escapeChars = new Set([' ', '\\', '   ', '\n', '"', '"']);

const merge = (bigArr, littleArr) => {
    let string = '' + bigArr[0];

    for (let i = 1; i < bigArr.length; i++) {
        string += littleArr[i - 1];
        string += bigArr[i];
    }

    return string;
}

const shellEscape = (string) => {

    let newString = '';
    
    for (const c of ('' + string)) {
        if (escapeChars.has(c)) {
            newString += '\\' + c;
        } else {
            newString += c;
        }
    }

    return newString;
}

const compile = (strings, args) => {
    const escaped = args.map((arg) => shellEscape(arg));
    const code = merge(strings, escaped);

    return code;
}

const $ = (strings, ...args) => {
    return execSync(compile(strings, args), {stdio: 'inherit'});
}

const run = (fn) => {
    const sequence = [];

    const runner = (strings, ...args) => {
        sequence.push(compile(strings, args));
    }

    fn(runner);

    return execSync(sequence.join(' && '), {stdio: 'inherit'});
}

module.exports = {$, run};
