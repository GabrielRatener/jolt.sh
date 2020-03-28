
const cp = require('child_process');
const {Spawn} = require('./spawn');

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

const createRunner = (customizations = {}) => {
  const options = {
    stdio: 'inherit',
    ...customizations
  }

  return (strings, ...args) => {
    return cp.execSync(compile(strings, args), {stdio: options.stdio});
  }
}

const execCodeAsync = (code, customizations) => {
  const options = {
    ...customizations
  }

  const execOptions = {};

  return new Promise((resolve, reject) => {
    return cp.exec(code, execOptions, (err, stdout, stderr) => {
      if (err || stderr) {
        
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

const createAsyncRunner = (customizations = {}) => {

  return (strings, ...args) => {

    return execCodeAsync(compile(strings, args), customizations);
  }
}

const spawnFromCode = (code, customizations) => {
  const options = {
    shell: true,
    ...customizations
  };

  const spawnOptions = {shell: options.shell};

  return new Spawn((send, close) => {
    const proc = cp.spawn(code, spawnOptions);

    let result = '';

    proc.stdout.on('data', (data) => {
      const text = data.toString();

      send({type: 'stdout', text});

      result += text;
    });

    proc.stderr.on('data', (data) => {
      send({type: 'stderr', text: data.toString()});
    });

    proc.on('close', (code) => {
      close(result);
    });
  });
}

const createSpawnRunner = (customizations = {}) => {

  const options = {
    ...customizations
  }

  return (strings, ...args) => {
    return spawnFromCode(compile(strings, args));
  }
}

const $ = createRunner();

const extractCode = (fn) => {

  const sequence = [];
  const runner = (strings, ...args) => {
    sequence.push(compile(strings, args));
  }

  fn(runner);

  return sequence.join(' && ');
}

const run = (fn, options = {stdio: 'inherit'}) => {
  
  return cp.execSync(extractCode(fn), {stdio: options.stdio});
}

const async = (fn, options = {}) => {
  
  return execCodeAsync(extractCode(fn), options);
}

const spawn = (fn, options = {}) => {
  return spawnFromCode(extractCode(fn));
}

const context = (customizations = {}) => {
  const options = {
    stdio: 'inherit',
    ...customizations
  }

  return {
    run(fn) {
      return run(fn, options);
    },

    async(fn) {
      return async(fn, options);
    },

    spawn(fn) {
      return spawn(fn, options);
    }
  }
}

module.exports = {
  $,
  
  createRunner,
  createAsyncRunner,
  createSpawnRunner,

  run, 
  async,
  spawn,

  context
};
