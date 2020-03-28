

# JOLT.SH

## Check it out, it's awesome!

### Basic Usage

```js

const {$} = require('jolt.sh');

// $ runs commands synchronously...


$`ls`;
// terminal output:
//  a-file.ext
//  anotherfile.anotherext

// print file contents to shell
$`cat a-file.ext`;

// delete the file
$`rm a-file.ext`;

// safe interpolation, always!
$`rm ${"a te&&ible'filename"}`;

```

### Let's get fancy

#### `createAsyncRunner([options])`

```js

const {createAsyncRunner} = require('jolt.sh');

// let's run some async code...
(async() => {
    const $ = createAsyncRunner();

    // non-blocking execution
    // contents = stdout of execution
    const contents = await $`cat a-file.ext`;

    // log contents on our terminal
    console.log(contents);
})();

```

#### `createSpawnRunner([options])`

```js

const {createSpawnRunner} = require('jolt.sh');

// let's run some async code...
(async() => {
    const $ = createSpawnRunner();

    // monitor output from http server instance
    // and log it to current shell
    for await (const {type, text} of $`http-server .`) {
        // type = 'stdout' | 'stderr'
        // text <=> console output text

        console.log(`${type}:\n${text}\n`);
    }
})();

```

#### `context([options])`

Regular runners only allow an isolated command to be called. However `context()` solves this problem by allowing commands to elegantly and safely be concatenated.

```js

const {context} = require('jolt.sh');

const serveDir = "my public dir";

// cd into a directory and serve files from it
// equivalent to running $`cd ${serveDir} && http-server .`
const activity = context([options]).spawn(($) => {
    // now we can `cd` into a directory and serve files from it
    $`cd ${serveDir}` // `cd my\ public\ dir`
    $`http-server .`;
})

// let's run some async code...
(async() => {

    // monitor output from http server above
    for await (const {type, text} of activity) {

        console.log(`${type}:\n${text}\n`);
    }
})();

// or sync
context().run(($) => {

    // cd into a directory and read a file in it.
    $`cd somedir`;
    $`cat a-file-inside-somedir.txt`;
});

// or simple async
(async() => {
    const fileContents = await context().async(($) => {
        $`cd somedir`;
        $`cat a-file-inside-somedir.txt`;
    });

    // afterwards log file contents...
    console.log(`file contents:\n${fileContents}\n`);
})();

```

### Are you happy?

#### Is there something here that isn't clear?

If so send me an email or open an issue with the `documentation` tag.

#### Is there something awesome you which Jolt.sh would do?

If so, open an issue, and let the discussion begin!