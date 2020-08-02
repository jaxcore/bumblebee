## About

This example uses [robotjs](https://www.npmjs.com/package/robotjs) to control the computer number keys and math symbols.

Saying the following words will press the corresponding key(s) on the keyboard:

- all numbers:
	- "one" `1`
	- "fifty" `50`
	- "negative one fifty" `-150`
	- "five hundred" `500`
	- "five thousand and five" `5005`
	- "twenty four million and five" `24000005`
- floating point numbers:
	- "one point five" `1.5`
	- "sixteen decminal zero one" `16.01`
- all math-related symbols:
	- "plus" `+`
	- "minus" `-`
	- "times" `*`
	- "equals" `=`
	- "divided by" `/`
- specific keys:
	- "space"
	- "tab"
	- "enter"
	- "escape"
	- "home"
	- "end"
	- "delete"
	- "backspace"
	- "comma" `,`
	- "colon" `:`
	- "semi colon" `;`
	- "left brace" `[` or "right brace" `]`
	- "left curly backet" `{`or "left curly backet" `]`
	- "left bracket `(` or "right bracket" `)`
- arrow keys:
	- "up"
	- "down"
	- "left"
	- "right"
- modifier + direction:
	- "shift left"
	- "option left" OR "alt left"
	- "control left"
	- "command left"
	- "option shift left"
- "hold shift" and "release shift"
- "select all" - presses `Command-A`
- "copy" - presses `Control-C` (win/linux) and `Command-C` (mac)
- "paste" - presses `Control-V` (win/linux) or `Command-V` (mac)

For something try, open your operating system's calculator app, and then run this program and see if you can use the calculator with your voice.

### Install and Run Bumblebee

Make sure you have installed the [bumblebee](https://github.com/jaxcore/bumblebee) desktop app and that it is running properly.

### Install NPM modules

```
npm install
```

### Run Example

```
node start.js
```